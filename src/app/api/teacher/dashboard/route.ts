import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { errorResponse } from "@/lib/api/helpers"

// GET /api/teacher/dashboard - Get teacher dashboard data
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return errorResponse("Unauthorized", 401)
    if (session.role !== "TEACHER") return errorResponse("Forbidden", 403)

    const userId = session.userId || session.id

    // Check if teacher profile exists
    let teacher = await prisma.teacher.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true, image: true } },
        classes: {
          include: {
            _count: {
              select: { enrollments: true, assignments: true, exams: true, materials: true }
            },
            enrollments: {
              where: { status: "PENDING" },
              select: { id: true }
            }
          }
        }
      }
    })

    // If teacher profile doesn't exist, create one
    if (!teacher) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return errorResponse("User not found", 404)
      }

      teacher = await prisma.teacher.create({
        data: {
          userId,
          department: "Not Set",
          subject: "Not Set",
          university: "Not Set",
        },
        include: {
          user: { select: { name: true, email: true, image: true } },
          classes: {
            include: {
              _count: {
                select: { enrollments: true, assignments: true, exams: true, materials: true }
              },
              enrollments: {
                where: { status: "PENDING" },
                select: { id: true }
              }
            }
          }
        }
      })
    }

    const classIds = teacher.classes.map(c => c.id)

    // Get total students across all classes
    const totalStudents = classIds.length > 0 ? await prisma.classEnrollment.count({
      where: {
        classId: { in: classIds },
        status: "APPROVED"
      }
    }) : 0

    // Get pending join requests
    const pendingRequests = teacher.classes.reduce((acc, c) => acc + c.enrollments.length, 0)

    // Get assignments to grade
    const assignmentsToGrade = classIds.length > 0 ? await prisma.submission.count({
      where: {
        assignment: { classId: { in: classIds } },
        status: "SUBMITTED",
        marks: null
      }
    }) : 0

    // Get recent submissions
    const recentSubmissions = classIds.length > 0 ? await prisma.submission.findMany({
      where: {
        assignment: { classId: { in: classIds } }
      },
      include: {
        student: {
          include: { user: { select: { name: true, email: true } } }
        },
        assignment: { select: { title: true, classId: true } }
      },
      orderBy: { submittedAt: "desc" },
      take: 10
    }) : []

    // Get upcoming exams
    const upcomingExams = classIds.length > 0 ? await prisma.exam.findMany({
      where: {
        classId: { in: classIds },
        startTime: { gte: new Date() }
      },
      include: {
        class: { select: { name: true, code: true } }
      },
      orderBy: { startTime: "asc" },
      take: 5
    }) : []

    // Get recent notifications
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5
    })

    return NextResponse.json({
      success: true,
      data: {
        teacher: {
          id: teacher.id,
          name: teacher.user.name,
          email: teacher.user.email,
          image: teacher.user.image,
          employeeId: teacher.employeeId,
          department: teacher.department,
          subject: teacher.subject,
          university: teacher.university,
        },
        stats: {
          totalClasses: teacher.classes.length,
          activeClasses: teacher.classes.filter(c => c.isActive).length,
          totalStudents,
          pendingRequests,
          assignmentsToGrade,
        },
        classes: teacher.classes.map(c => ({
          id: c.id,
          name: c.name,
          code: c.code,
          description: c.description,
          department: c.department,
          semester: c.semester,
          subject: c.subject,
          isActive: c.isActive,
          _count: c._count,
          pendingRequests: c.enrollments.length,
        })),
        recentSubmissions: recentSubmissions.map(s => ({
          id: s.id,
          studentName: s.student.user.name,
          studentEmail: s.student.user.email,
          assignmentTitle: s.assignment.title,
          submittedAt: s.submittedAt,
          status: s.status,
          marks: s.marks,
        })),
        upcomingExams,
        notifications,
      }
    })
  } catch (error) {
    console.error("Teacher dashboard error:", error)
    return errorResponse("Internal server error", 500)
  }
}
