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

// GET - Get attendance sessions
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    let where: any = {}

    if (classId) {
      where.classId = classId
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    if (user.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } })
      if (!teacher) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
      }
      const teacherClasses = await prisma.class.findMany({
        where: { teacherId: teacher.id },
        select: { id: true }
      })
      where.classId = { in: teacherClasses.map(c => c.id) }
    } else if (user.role === "STUDENT") {
      const student = await prisma.student.findUnique({ where: { userId: user.id } })
      if (!student) {
        return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
      }
      const enrollments = await prisma.classEnrollment.findMany({
        where: { studentId: student.id, status: "APPROVED" },
        select: { classId: true }
      })
      where.classId = { in: enrollments.map(e => e.classId) }
    }

    const sessions = await prisma.attendanceSession.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, code: true, subject: true } },
        attendances: {
          include: {
            student: { include: { user: { select: { name: true, email: true } } } }
          }
        },
        _count: { select: { attendances: true } }
      },
      orderBy: { date: "desc" },
      skip,
      take: limit
    })

    const total = await prisma.attendanceSession.count({ where })

    return NextResponse.json({
      success: true,
      data: sessions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error("Error fetching attendance sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create attendance session (Teacher)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can create attendance sessions" }, { status: 403 })
    }

    const body = await request.json()
    const { classId, date, topic, attendances } = body

    if (!classId || !date) {
      return NextResponse.json({ error: "Class ID and date are required" }, { status: 400 })
    }

    // Verify teacher owns this class
    if (user.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } })
      const classData = await prisma.class.findFirst({
        where: { id: classId, teacherId: teacher?.id }
      })
      if (!classData) {
        return NextResponse.json({ error: "Class not found or not authorized" }, { status: 404 })
      }
    }

    // Check if session already exists for this date
    const existingSession = await prisma.attendanceSession.findUnique({
      where: { classId_date: { classId, date: new Date(date) } }
    })

    if (existingSession) {
      return NextResponse.json({ error: "Attendance session already exists for this date" }, { status: 400 })
    }

    // Create session with attendances
    const session = await prisma.attendanceSession.create({
      data: {
        classId,
        date: new Date(date),
        topic,
        attendances: attendances ? {
          create: attendances.map((a: { studentId: string, status: string, remarks?: string }) => ({
            studentId: a.studentId,
            status: a.status,
            remarks: a.remarks
          }))
        } : undefined
      },
      include: {
        class: { select: { name: true } },
        attendances: {
          include: {
            student: { include: { user: { select: { name: true } } } }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "Attendance session created",
      data: session
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating attendance session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update attendance (Teacher)
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can update attendance" }, { status: 403 })
    }

    const body = await request.json()
    const { sessionId, attendances } = body

    if (!sessionId || !attendances || !Array.isArray(attendances)) {
      return NextResponse.json({ error: "Session ID and attendances array required" }, { status: 400 })
    }

    // Verify session exists and teacher owns it
    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: { class: { include: { teacher: true } } }
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (user.role === "TEACHER" && session.class.teacher.userId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Update or create attendance records
    for (const att of attendances) {
      await prisma.attendance.upsert({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId: att.studentId
          }
        },
        update: {
          status: att.status,
          remarks: att.remarks
        },
        create: {
          sessionId,
          studentId: att.studentId,
          status: att.status,
          remarks: att.remarks
        }
      })
    }

    const updatedSession = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        attendances: {
          include: {
            student: { include: { user: { select: { name: true } } } }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "Attendance updated",
      data: updatedSession
    })
  } catch (error) {
    console.error("Error updating attendance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete attendance session
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can delete attendance sessions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: { class: { include: { teacher: true } } }
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (user.role === "TEACHER" && session.class.teacher.userId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    await prisma.attendanceSession.delete({ where: { id: sessionId } })

    return NextResponse.json({ success: true, message: "Attendance session deleted" })
  } catch (error) {
    console.error("Error deleting attendance session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
