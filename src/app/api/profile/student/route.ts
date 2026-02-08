import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { checkRateLimit } from "@/lib/rate-limit"

// Get current user helper
async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session?.user
}

// GET - Get student profile
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, "profile-student-get", 60)
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

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
        classEnrollments: {
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
              },
            },
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    }

    return NextResponse.json(student, { headers: rateLimitResult.headers })
  } catch (error) {
    console.error("Error fetching student profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create student profile
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await checkRateLimit(request, "profile-student-create", 10)
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

    const data = await request.json()

    // Check if profile already exists
    const existing = await prisma.student.findUnique({
      where: { userId: user.id },
    })

    if (existing) {
      return NextResponse.json({ error: "Student profile already exists" }, { status: 400 })
    }

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        phone: data.phone,
        department: data.department,
        semester: data.semester,
        section: data.section,
        batch: data.batch,
        address: data.address,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
      },
    })

    return NextResponse.json(student, { status: 201, headers: rateLimitResult.headers })
  } catch (error) {
    console.error("Error creating student profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update student profile
export async function PUT(request: NextRequest) {
  try {
    const rateLimitResult = await checkRateLimit(request, "profile-student-update", 30)
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

    const data = await request.json()

    const student = await prisma.student.update({
      where: { userId: user.id },
      data: {
        phone: data.phone,
        department: data.department,
        semester: data.semester,
        section: data.section,
        batch: data.batch,
        address: data.address,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
      },
    })

    return NextResponse.json(student, { headers: rateLimitResult.headers })
  } catch (error) {
    console.error("Error updating student profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
