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

// GET - Get single class details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        teacher: { include: { user: { select: { name: true, email: true, image: true } } } },
        enrollments: {
          include: {
            student: { include: { user: { select: { id: true, name: true, email: true, image: true } } } }
          }
        },
        assignments: {
          orderBy: { dueDate: "asc" },
          take: 5
        },
        exams: {
          orderBy: { startTime: "asc" },
          take: 5
        },
        attendanceSessions: {
          orderBy: { date: "desc" },
          take: 5
        },
        announcements: {
          orderBy: { createdAt: "desc" },
          take: 5
        },
        _count: {
          select: {
            enrollments: true,
            assignments: true,
            exams: true,
            materials: true
          }
        }
      }
    })

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: classData })
  } catch (error) {
    console.error("Error fetching class:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update class (Teacher only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existingClass = await prisma.class.findUnique({
      where: { id },
      include: { teacher: true }
    })

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Check if user is the teacher of this class or admin
    if (user.role !== "ADMIN" && existingClass.teacher.userId !== user.id) {
      return NextResponse.json({ error: "Not authorized to update this class" }, { status: 403 })
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        department: body.department,
        semester: body.semester ? parseInt(body.semester) : undefined,
        subject: body.subject,
        isActive: body.isActive
      },
      include: {
        teacher: { include: { user: { select: { name: true, email: true } } } }
      }
    })

    return NextResponse.json({
      success: true,
      message: "Class updated successfully",
      data: updatedClass
    })
  } catch (error) {
    console.error("Error updating class:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete class (Teacher only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existingClass = await prisma.class.findUnique({
      where: { id },
      include: { teacher: true }
    })

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Check if user is the teacher of this class or admin
    if (user.role !== "ADMIN" && existingClass.teacher.userId !== user.id) {
      return NextResponse.json({ error: "Not authorized to delete this class" }, { status: 403 })
    }

    await prisma.class.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: "Class deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting class:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
