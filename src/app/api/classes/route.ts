import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { checkRateLimit } from "@/lib/rate-limit"
import { generateClassCode } from "@/lib/utils"

async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session?.user
}

// GET - Get classes
export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = await checkRateLimit(request, "classes-get", 60)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: rateLimitResult.headers }
      )
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role") || "STUDENT"
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    let classes
    let total

    if (role === "TEACHER") {
      // Get teacher's classes
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
      })

      if (!teacher) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
      }

      const where = {
        teacherId: teacher.id,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { subject: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      }

      [classes, total] = await Promise.all([
        prisma.class.findMany({
          where,
          include: {
            _count: {
              select: {
                enrollments: { where: { status: "APPROVED" } },
                assignments: true,
                exams: true,
              },
            },
            enrollments: {
              where: { status: "PENDING" },
              select: { id: true },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.class.count({ where }),
      ])
    } else {
      // Get student's enrolled classes
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      })

      if (!student) {
        return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
      }

      const where = {
        studentId: student.id,
        status: "APPROVED" as const,
        ...(search && {
          class: {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { subject: { contains: search, mode: "insensitive" as const } },
            ],
          },
        }),
      }

      const [enrollments, totalEnrollments] = await Promise.all([
        prisma.classEnrollment.findMany({
          where,
          include: {
            class: {
              include: {
                teacher: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        image: true,
                      },
                    },
                  },
                },
                _count: {
                  select: {
                    enrollments: { where: { status: "APPROVED" } },
                    assignments: true,
                    exams: true,
                  },
                },
              },
            },
          },
          orderBy: { joinedAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.classEnrollment.count({ where }),
      ])

      classes = enrollments.map((e) => e.class)
      total = totalEnrollments
    }

    return NextResponse.json(
      {
        classes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { headers: rateLimitResult.headers }
    )
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create new class (teacher only)
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await checkRateLimit(request, "classes-create", 10)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: rateLimitResult.headers }
      )
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
    })

    if (!teacher) {
      return NextResponse.json({ error: "Only teachers can create classes" }, { status: 403 })
    }

    const data = await request.json()

    // Generate unique class code
    let code = generateClassCode()
    let existingClass = await prisma.class.findUnique({ where: { code } })
    while (existingClass) {
      code = generateClassCode()
      existingClass = await prisma.class.findUnique({ where: { code } })
    }

    const newClass = await prisma.class.create({
      data: {
        name: data.name,
        code,
        description: data.description,
        department: data.department,
        semester: data.semester,
        subject: data.subject,
        teacherId: teacher.id,
      },
    })

    return NextResponse.json(newClass, { status: 201, headers: rateLimitResult.headers })
  } catch (error) {
    console.error("Error creating class:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
