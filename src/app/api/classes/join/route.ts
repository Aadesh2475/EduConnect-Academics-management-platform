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

// POST - Join a class (Student)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can join classes" }, { status: 403 })
    }

    const body = await request.json()
    const { classCode } = body

    if (!classCode) {
      return NextResponse.json({ error: "Class code is required" }, { status: 400 })
    }

    // Find the class by code
    const classData = await prisma.class.findUnique({
      where: { code: classCode }
    })

    if (!classData) {
      return NextResponse.json({ error: "Invalid class code" }, { status: 404 })
    }

    if (!classData.isActive) {
      return NextResponse.json({ error: "This class is no longer active" }, { status: 400 })
    }

    // Get or create student profile
    let student = await prisma.student.findUnique({ where: { userId: user.id } })
    if (!student) {
      student = await prisma.student.create({
        data: {
          userId: user.id,
          department: classData.department,
          semester: classData.semester
        }
      })
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.classEnrollment.findUnique({
      where: {
        classId_studentId: {
          classId: classData.id,
          studentId: student.id
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json({
        error: existingEnrollment.status === "PENDING" 
          ? "Join request already pending" 
          : existingEnrollment.status === "APPROVED"
            ? "Already enrolled in this class"
            : "Previous join request was rejected"
      }, { status: 400 })
    }

    // Create enrollment request
    const enrollment = await prisma.classEnrollment.create({
      data: {
        classId: classData.id,
        studentId: student.id,
        status: "PENDING"
      },
      include: {
        class: { select: { name: true, code: true } }
      }
    })

    // Create notification for teacher
    const classWithTeacher = await prisma.class.findUnique({
      where: { id: classData.id },
      include: { teacher: { include: { user: true } } }
    })

    if (classWithTeacher) {
      await prisma.notification.create({
        data: {
          userId: classWithTeacher.teacher.userId,
          title: "New Join Request",
          message: `${user.name} has requested to join ${classData.name}`,
          type: "info",
          link: `/dashboard/teacher/classes/${classData.id}/requests`
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "Join request sent successfully. Waiting for teacher approval.",
      data: enrollment
    }, { status: 201 })
  } catch (error) {
    console.error("Error joining class:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Get pending join requests (Teacher)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can view join requests" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")
    const status = searchParams.get("status") || "PENDING"

    let where: any = { status }

    if (user.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } })
      if (!teacher) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
      }

      if (classId) {
        // Verify this class belongs to the teacher
        const classData = await prisma.class.findFirst({
          where: { id: classId, teacherId: teacher.id }
        })
        if (!classData) {
          return NextResponse.json({ error: "Class not found or not authorized" }, { status: 404 })
        }
        where.classId = classId
      } else {
        // Get all pending requests for teacher's classes
        const teacherClasses = await prisma.class.findMany({
          where: { teacherId: teacher.id },
          select: { id: true }
        })
        where.classId = { in: teacherClasses.map(c => c.id) }
      }
    } else if (classId) {
      where.classId = classId
    }

    const requests = await prisma.classEnrollment.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, code: true, subject: true } },
        student: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ success: true, data: requests })
  } catch (error) {
    console.error("Error fetching join requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Accept/Reject join request (Teacher)
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can manage join requests" }, { status: 403 })
    }

    const body = await request.json()
    const { enrollmentId, action } = body

    if (!enrollmentId || !action || !["APPROVED", "REJECTED"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const enrollment = await prisma.classEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        class: { include: { teacher: true } },
        student: { include: { user: true } }
      }
    })

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment request not found" }, { status: 404 })
    }

    // Verify teacher owns this class
    if (user.role === "TEACHER" && enrollment.class.teacher.userId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const updatedEnrollment = await prisma.classEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: action,
        joinedAt: action === "APPROVED" ? new Date() : null
      }
    })

    // Create notification for student
    await prisma.notification.create({
      data: {
        userId: enrollment.student.userId,
        title: action === "APPROVED" ? "Class Join Approved" : "Class Join Rejected",
        message: action === "APPROVED"
          ? `Your request to join ${enrollment.class.name} has been approved!`
          : `Your request to join ${enrollment.class.name} has been rejected.`,
        type: action === "APPROVED" ? "success" : "warning",
        link: action === "APPROVED" ? `/dashboard/student/classes/${enrollment.class.id}` : undefined
      }
    })

    return NextResponse.json({
      success: true,
      message: action === "APPROVED" ? "Student approved" : "Student rejected",
      data: updatedEnrollment
    })
  } catch (error) {
    console.error("Error processing join request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
