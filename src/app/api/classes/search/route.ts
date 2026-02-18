import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"

async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value

  if (!sessionToken) return null

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true }
  })

  if (!session || session.expires < new Date()) return null
  return session.user
}

// GET - Search classes by code
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code || code.length < 3) {
      return NextResponse.json({ 
        error: "Please enter at least 3 characters of the class code" 
      }, { status: 400 })
    }

    const classData = await prisma.class.findFirst({
      where: {
        code: {
          contains: code
        },
        isActive: true
      },
      include: {
        teacher: {
          include: { user: { select: { name: true, email: true, image: true } } }
        },
        _count: {
          select: { enrollments: { where: { status: "APPROVED" } } }
        }
      }
    })

    if (!classData) {
      return NextResponse.json({ 
        success: false, 
        error: "No class found with this code" 
      }, { status: 404 })
    }

    // Check if student is already enrolled
    let enrollmentStatus = null
    if (user.role === "STUDENT") {
      const student = await prisma.student.findUnique({ where: { userId: user.id } })
      if (student) {
        const enrollment = await prisma.classEnrollment.findUnique({
          where: {
            classId_studentId: {
              classId: classData.id,
              studentId: student.id
            }
          }
        })
        enrollmentStatus = enrollment?.status || null
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: classData.id,
        name: classData.name,
        code: classData.code,
        description: classData.description,
        department: classData.department,
        semester: classData.semester,
        subject: classData.subject,
        teacher: {
          name: classData.teacher.user.name,
          email: classData.teacher.user.email,
          image: classData.teacher.user.image
        },
        studentCount: classData._count.enrollments,
        enrollmentStatus
      }
    })
  } catch (error) {
    console.error("Error searching classes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
