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

// GET - List exams/quizzes
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")
    const type = searchParams.get("type")
    const status = searchParams.get("status") // upcoming, ongoing, past
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    let where: any = {}
    const now = new Date()

    if (classId) where.classId = classId
    if (type) where.type = type

    if (status === "upcoming") {
      where.startTime = { gt: now }
    } else if (status === "ongoing") {
      where.startTime = { lte: now }
      where.endTime = { gte: now }
    } else if (status === "past") {
      where.endTime = { lt: now }
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

      const exams = await prisma.exam.findMany({
        where,
        include: {
          class: { select: { id: true, name: true, subject: true } },
          attempts: { where: { studentId: student.id } },
          _count: { select: { questions: true } }
        },
        orderBy: { startTime: "asc" },
        skip,
        take: limit
      })

      const total = await prisma.exam.count({ where })

      return NextResponse.json({
        success: true,
        data: exams,
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

    const exams = await prisma.exam.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, subject: true } },
        questions: true,
        attempts: {
          include: {
            student: { include: { user: { select: { name: true, email: true } } } }
          }
        },
        _count: { select: { questions: true, attempts: true } }
      },
      orderBy: { startTime: "asc" },
      skip,
      take: limit
    })

    const total = await prisma.exam.count({ where })

    return NextResponse.json({
      success: true,
      data: exams,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error("Error fetching exams:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create exam/quiz (Teacher)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can create exams" }, { status: 403 })
    }

    const body = await request.json()
    const { 
      title, description, type, classId, duration, totalMarks, 
      passingMarks, startTime, endTime, shuffleQuestions, showResults, questions 
    } = body

    if (!title || !classId || !duration || !totalMarks || !startTime || !endTime) {
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

    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        type: type || "QUIZ",
        classId,
        duration: parseInt(duration),
        totalMarks: parseInt(totalMarks),
        passingMarks: passingMarks ? parseInt(passingMarks) : null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        shuffleQuestions: shuffleQuestions || false,
        showResults: showResults !== false,
        questions: questions ? {
          create: questions.map((q: any, index: number) => ({
            type: q.type,
            question: q.question,
            options: q.options ? JSON.stringify(q.options) : null,
            answer: q.answer,
            marks: q.marks,
            explanation: q.explanation,
            order: index
          }))
        } : undefined
      },
      include: {
        class: { select: { name: true } },
        questions: true
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
          title: `New ${type || 'Quiz'}`,
          message: `${title} - Starts ${new Date(startTime).toLocaleString()}`,
          type: "info",
          link: `/dashboard/student/exams`
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "Exam created",
      data: exam
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating exam:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update exam
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can update exams" }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Exam ID required" }, { status: 400 })
    }

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: { class: { include: { teacher: true } } }
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    if (user.role === "TEACHER" && exam.class.teacher.userId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        title: updateData.title,
        description: updateData.description,
        type: updateData.type,
        duration: updateData.duration ? parseInt(updateData.duration) : undefined,
        totalMarks: updateData.totalMarks ? parseInt(updateData.totalMarks) : undefined,
        passingMarks: updateData.passingMarks ? parseInt(updateData.passingMarks) : undefined,
        startTime: updateData.startTime ? new Date(updateData.startTime) : undefined,
        endTime: updateData.endTime ? new Date(updateData.endTime) : undefined,
        shuffleQuestions: updateData.shuffleQuestions,
        showResults: updateData.showResults,
        isActive: updateData.isActive
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error("Error updating exam:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete exam
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can delete exams" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Exam ID required" }, { status: 400 })
    }

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: { class: { include: { teacher: true } } }
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    if (user.role === "TEACHER" && exam.class.teacher.userId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    await prisma.exam.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Exam deleted" })
  } catch (error) {
    console.error("Error deleting exam:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
