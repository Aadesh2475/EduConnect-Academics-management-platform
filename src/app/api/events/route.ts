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

// GET - List events
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
    const type = searchParams.get("type")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    let where: any = {}

    // Date filtering
    if (startDate || endDate) {
      where.startDate = {}
      if (startDate) where.startDate.gte = new Date(startDate)
      if (endDate) where.startDate.lte = new Date(endDate)
    }

    if (type) where.type = type

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
      
      where.OR = [
        { isGlobal: true },
        { classId: { in: enrollments.map(e => e.classId) } }
      ]
    } else if (user.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } })
      if (!teacher) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
      }
      
      const teacherClasses = await prisma.class.findMany({
        where: { teacherId: teacher.id },
        select: { id: true }
      })
      
      where.OR = [
        { isGlobal: true },
        { classId: { in: teacherClasses.map(c => c.id) } },
        { createdBy: user.id }
      ]
    }

    if (classId) {
      where.classId = classId
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, code: true } }
      },
      orderBy: { startDate: "asc" },
      skip,
      take: limit
    })

    const total = await prisma.event.count({ where })

    return NextResponse.json({
      success: true,
      data: events,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create event
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, type, startDate, endDate, allDay, location, color, classId, isGlobal } = body

    if (!title || !type || !startDate) {
      return NextResponse.json({ error: "Title, type and start date are required" }, { status: 400 })
    }

    // Verify class ownership if classId provided
    if (classId && user.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } })
      const classData = await prisma.class.findFirst({
        where: { id: classId, teacherId: teacher?.id }
      })
      if (!classData) {
        return NextResponse.json({ error: "Class not found or not authorized" }, { status: 403 })
      }
    }

    // Only admin can create global events
    if (isGlobal && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can create global events" }, { status: 403 })
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        type,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        allDay: allDay || false,
        location,
        color,
        classId,
        createdBy: user.id,
        isGlobal: isGlobal || false
      },
      include: {
        class: { select: { name: true } }
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
            title: "New Event",
            message: `New ${type} event: ${title}`,
            type: "info",
            link: `/dashboard/student/calendar`
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Event created successfully",
      data: event
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update event
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 })
    }

    const existingEvent = await prisma.event.findUnique({ where: { id } })
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check authorization
    if (user.role !== "ADMIN" && existingEvent.createdBy !== user.id) {
      return NextResponse.json({ error: "Not authorized to update this event" }, { status: 403 })
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        title: updateData.title,
        description: updateData.description,
        type: updateData.type,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
        allDay: updateData.allDay,
        location: updateData.location,
        color: updateData.color
      }
    })

    return NextResponse.json({
      success: true,
      message: "Event updated",
      data: event
    })
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete event
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 })
    }

    const existingEvent = await prisma.event.findUnique({ where: { id } })
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (user.role !== "ADMIN" && existingEvent.createdBy !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    await prisma.event.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Event deleted" })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
