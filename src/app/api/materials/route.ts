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

// GET - List materials
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")
    const type = searchParams.get("type")
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
        where.classId = { in: enrollments.map(e => e.classId) }
      }
    } else if (user.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } })
      if (teacher) {
        const teacherClasses = await prisma.class.findMany({
          where: { teacherId: teacher.id },
          select: { id: true }
        })
        where.classId = { in: teacherClasses.map(c => c.id) }
      }
    }

    if (type) where.type = type

    const materials = await prisma.material.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, code: true, subject: true } }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    })

    const total = await prisma.material.count({ where })

    return NextResponse.json({
      success: true,
      data: materials,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error("Error fetching materials:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create material (Teacher)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can upload materials" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, type, url, content, classId } = body

    if (!title || !type || !classId) {
      return NextResponse.json({ error: "Title, type and classId are required" }, { status: 400 })
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

    const material = await prisma.material.create({
      data: {
        title,
        description,
        type,
        url,
        content,
        classId
      },
      include: {
        class: { select: { name: true } }
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
          title: "New Material",
          message: `New ${type} uploaded in ${material.class.name}: ${title}`,
          type: "info",
          link: `/dashboard/student/materials`
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "Material uploaded",
      data: material
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating material:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update material
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can update materials" }, { status: 403 })
    }

    const body = await request.json()
    const { id, title, description, type, url, content } = body

    if (!id) {
      return NextResponse.json({ error: "Material ID required" }, { status: 400 })
    }

    const material = await prisma.material.findUnique({
      where: { id },
      include: { class: { include: { teacher: true } } }
    })

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 })
    }

    if (user.role === "TEACHER" && material.class.teacher.userId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const updated = await prisma.material.update({
      where: { id },
      data: { title, description, type, url, content }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error("Error updating material:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete material
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can delete materials" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Material ID required" }, { status: 400 })
    }

    const material = await prisma.material.findUnique({
      where: { id },
      include: { class: { include: { teacher: true } } }
    })

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 })
    }

    if (user.role === "TEACHER" && material.class.teacher.userId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    await prisma.material.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Material deleted" })
  } catch (error) {
    console.error("Error deleting material:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
