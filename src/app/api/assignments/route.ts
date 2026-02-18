import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"

async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value

  if (!sessionToken) return null

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        include: {
          teacher: true,
          student: true
        }
      }
    }
  })

  if (!session || session.expires < new Date()) return null
  return session.user
}

// GET - List assignments
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")
    const status = searchParams.get("status") // active, past, all
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    let where: any = {}
    const now = new Date()

    if (classId) where.classId = classId

    if (status === "active") {
      where.dueDate = { gte: now }
      where.isActive = true
    } else if (status === "past") {
      where.dueDate = { lt: now }
    }

    // Role-based filtering
    if (user.role === "STUDENT") {
      const student = await prisma.student.findUnique({ where: { userId: user.id } })
      if (!student) {
        return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
      }
      
      const enrollments = await prisma.classEnrollment.findMany({
        where: { studentId: student.id, status: "APPROVED" },
        select: { classId: true }
      })
      
      where.classId = { in: enrollments.map(e => e.classId) }

      const assignments = await prisma.assignment.findMany({
        where,
        include: {
          class: { select: { id: true, name: true, code: true, subject: true } },
          submissions: {
            where: { studentId: student.id }
          },
          _count: { select: { submissions: true } }
        },
        orderBy: { dueDate: "asc" },
        skip,
        take: limit
      })

      const total = await prisma.assignment.count({ where })

      return NextResponse.json({
        success: true,
        data: assignments,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      })
    } else if (user.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } })
      if (!teacher) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
      }
      
      const teacherClasses = await prisma.class.findMany({
        where: { teacherId: teacher.id },
        select: { id: true }
      })
      
      if (!classId) {
        where.classId = { in: teacherClasses.map(c => c.id) }
      }
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, code: true, subject: true } },
        submissions: {
          include: {
            student: { include: { user: { select: { name: true, email: true } } } }
          }
        },
        rubrics: true,
        _count: { select: { submissions: true } }
      },
      orderBy: { dueDate: "asc" },
      skip,
      take: limit
    })

    const total = await prisma.assignment.count({ where })

    return NextResponse.json({
      success: true,
      data: assignments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create assignment (Teacher)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can create assignments" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, instructions, dueDate, totalMarks, classId, attachments, rubrics } = body

    if (!title || !description || !dueDate || !classId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify class ownership
    if (user.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } })
      const classData = await prisma.class.findFirst({
        where: { id: classId, teacherId: teacher?.id }
      })
      if (!classData) {
        return NextResponse.json({ error: "Class not found or not authorized" }, { status: 403 })
      }
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        instructions,
        dueDate: new Date(dueDate),
        totalMarks: totalMarks || 100,
        classId,
        attachments: attachments ? JSON.stringify(attachments) : null,
        rubrics: rubrics ? {
          create: rubrics.map((r: { criteria: string, maxPoints: number, description?: string }) => ({
            criteria: r.criteria,
            maxPoints: r.maxPoints,
            description: r.description
          }))
        } : undefined
      },
      include: {
        class: { select: { name: true } },
        rubrics: true
      }
    })

    // Notify enrolled students
    const enrollments = await prisma.classEnrollment.findMany({
      where: { classId, status: "APPROVED" },
      include: { student: true }
    })

    for (const enrollment of enrollments) {
      await prisma.notification.create({
        data: {
          userId: enrollment.student.userId,
          title: "New Assignment",
          message: `New assignment: ${title} - Due ${new Date(dueDate).toLocaleDateString()}`,
          type: "info",
          link: `/dashboard/student/assignments`
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "Assignment created",
      data: assignment
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update assignment or grade submission
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === "grade") {
      // Grade submission
      if (user.role !== "TEACHER" && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Only teachers can grade" }, { status: 403 })
      }

      const { submissionId, marks, feedback } = body

      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: { assignment: { include: { class: { include: { teacher: true } } } } }
      })

      if (!submission) {
        return NextResponse.json({ error: "Submission not found" }, { status: 404 })
      }

      if (user.role === "TEACHER" && submission.assignment.class.teacher.userId !== user.id) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 })
      }

      const updated = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          marks,
          feedback,
          status: "GRADED",
          gradedAt: new Date()
        }
      })

      // Notify student
      await prisma.notification.create({
        data: {
          userId: submission.student.userId,
          title: "Assignment Graded",
          message: `Your assignment "${submission.assignment.title}" has been graded: ${marks}/${submission.assignment.totalMarks}`,
          type: "success"
        }
      })

      return NextResponse.json({ success: true, data: updated })
    } else {
      // Update assignment
      const { id, ...updateData } = body

      if (user.role !== "TEACHER" && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Only teachers can update assignments" }, { status: 403 })
      }

      const assignment = await prisma.assignment.findUnique({
        where: { id },
        include: { class: { include: { teacher: true } } }
      })

      if (!assignment) {
        return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
      }

      if (user.role === "TEACHER" && assignment.class.teacher.userId !== user.id) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 })
      }

      const updated = await prisma.assignment.update({
        where: { id },
        data: {
          title: updateData.title,
          description: updateData.description,
          instructions: updateData.instructions,
          dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
          totalMarks: updateData.totalMarks,
          isActive: updateData.isActive
        }
      })

      return NextResponse.json({ success: true, data: updated })
    }
  } catch (error) {
    console.error("Error updating assignment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete assignment
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can delete assignments" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Assignment ID required" }, { status: 400 })
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: { class: { include: { teacher: true } } }
    })

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    if (user.role === "TEACHER" && assignment.class.teacher.userId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    await prisma.assignment.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Assignment deleted" })
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
