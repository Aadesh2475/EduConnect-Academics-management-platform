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

// GET - List announcements
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    let where: any = {}

    if (classId) {
      where.classId = classId
    } else if (user.role === "STUDENT") {
      const student = await prisma.student.findUnique({ where: { userId: user.id } })
      if (student) {
        const enrollments = await prisma.classEnrollment.findMany({
          where: { studentId: student.id, status: "APPROVED" },
          select: { classId: true }
        })
        where.OR = [
          { classId: { in: enrollments.map(e => e.classId) } },
          { isGlobal: true }
        ]
      } else {
        where.isGlobal = true
      }
    } else if (user.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } })
      if (teacher) {
        const teacherClasses = await prisma.class.findMany({
          where: { teacherId: teacher.id },
          select: { id: true }
        })
        where.OR = [
          { classId: { in: teacherClasses.map(c => c.id) } },
          { teacherId: teacher.id },
          { isGlobal: true }
        ]
      } else {
        where.isGlobal = true
      }
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, code: true } },
        teacher: { include: { user: { select: { name: true, email: true, image: true } } } }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    })

    const total = await prisma.announcement.count({ where })

    return NextResponse.json({
      success: true,
      data: announcements,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create announcement (Teacher/Admin)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can create announcements" }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, classId, priority, isGlobal } = body

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 })
    }

    // Only admin can create global announcements
    if (isGlobal && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can create global announcements" }, { status: 403 })
    }

    const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } })
    if (!teacher && user.role === "TEACHER") {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
    }

    // For admin creating global announcements, create a teacher profile if needed
    let teacherId = teacher?.id
    if (!teacherId && user.role === "ADMIN") {
      const adminTeacher = await prisma.teacher.create({
        data: {
          userId: user.id,
          department: "Administration",
          subject: "Administration",
          university: "System"
        }
      })
      teacherId = adminTeacher.id
    }

    // Verify class ownership if classId provided
    if (classId && user.role === "TEACHER") {
      const classData = await prisma.class.findFirst({
        where: { id: classId, teacherId: teacher?.id }
      })
      if (!classData) {
        return NextResponse.json({ error: "Class not found or not authorized" }, { status: 403 })
      }
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        classId,
        teacherId: teacherId!,
        priority: priority || "NORMAL",
        isGlobal: isGlobal || false
      },
      include: {
        class: { select: { name: true } },
        teacher: { include: { user: { select: { name: true } } } }
      }
    })

    // Notify relevant users
    if (classId) {
      const enrollments = await prisma.classEnrollment.findMany({
        where: { classId, status: "APPROVED" },
        include: { student: true }
      })

      for (const enrollment of enrollments) {
        await prisma.notification.create({
          data: {
            userId: enrollment.student.userId,
            title: "New Announcement",
            message: `${announcement.class?.name}: ${title}`,
            type: priority === "URGENT" ? "warning" : "info",
            link: `/dashboard/student/announcements`
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Announcement created",
      data: announcement
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating announcement:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update announcement
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can update announcements" }, { status: 403 })
    }

    const body = await request.json()
    const { id, title, content, priority } = body

    if (!id) {
      return NextResponse.json({ error: "Announcement ID required" }, { status: 400 })
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: { teacher: true }
    })

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    if (user.role !== "ADMIN" && announcement.teacher.userId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: { title, content, priority }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error("Error updating announcement:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete announcement
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can delete announcements" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Announcement ID required" }, { status: 400 })
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: { teacher: true }
    })

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    if (user.role !== "ADMIN" && announcement.teacher.userId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    await prisma.announcement.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Announcement deleted" })
  } catch (error) {
    console.error("Error deleting announcement:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
