import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"

// Helper to get current user from session
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

// GET - List all classes (with role-based filtering)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const skip = (page - 1) * limit

    let classes
    let total

    if (user.role === "ADMIN") {
      // Admin sees all classes
      const where = search ? {
        OR: [
          { name: { contains: search } },
          { code: { contains: search } },
          { subject: { contains: search } }
        ]
      } : {}
      
      classes = await prisma.class.findMany({
        where,
        include: {
          teacher: { include: { user: { select: { name: true, email: true, image: true } } } },
          _count: { select: { enrollments: true, assignments: true, exams: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      })
      total = await prisma.class.count({ where })
    } else if (user.role === "TEACHER") {
      // Teacher sees their own classes
      const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } })
      if (!teacher) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
      }

      const where: any = { teacherId: teacher.id }
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { code: { contains: search } },
          { subject: { contains: search } }
        ]
      }
      
      classes = await prisma.class.findMany({
        where,
        include: {
          teacher: { include: { user: { select: { name: true, email: true, image: true } } } },
          enrollments: {
            include: { student: { include: { user: { select: { name: true, email: true } } } } }
          },
          _count: { select: { enrollments: true, assignments: true, exams: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      })
      total = await prisma.class.count({ where })
    } else {
      // Student sees their enrolled classes
      const student = await prisma.student.findUnique({ where: { userId: user.id } })
      if (!student) {
        return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
      }

      const enrollments = await prisma.classEnrollment.findMany({
        where: { 
          studentId: student.id,
          status: "APPROVED"
        },
        include: {
          class: {
            include: {
              teacher: { include: { user: { select: { name: true, email: true, image: true } } } },
              _count: { select: { enrollments: true, assignments: true, exams: true } }
            }
          }
        },
        skip,
        take: limit
      })
      
      classes = enrollments.map(e => e.class)
      total = await prisma.classEnrollment.count({ where: { studentId: student.id, status: "APPROVED" } })
    }

    return NextResponse.json({
      success: true,
      data: classes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a new class (Teacher only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can create classes" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, department, semester, subject } = body

    if (!name || !department || !semester || !subject) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get or create teacher profile
    let teacher = await prisma.teacher.findUnique({ where: { userId: user.id } })
    if (!teacher) {
      teacher = await prisma.teacher.create({
        data: {
          userId: user.id,
          department,
          subject,
          university: "Default University"
        }
      })
    }

    // Generate unique class code
    const code = `${subject.substring(0, 3).toUpperCase()}${semester}${Date.now().toString(36).toUpperCase()}`

    const newClass = await prisma.class.create({
      data: {
        name,
        code,
        description,
        department,
        semester: parseInt(semester),
        subject,
        teacherId: teacher.id
      },
      include: {
        teacher: { include: { user: { select: { name: true, email: true } } } },
        _count: { select: { enrollments: true } }
      }
    })

    return NextResponse.json({
      success: true,
      message: "Class created successfully",
      data: newClass
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating class:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
