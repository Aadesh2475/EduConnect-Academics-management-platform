import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { errorResponse } from "@/lib/api/helpers"

// GET /api/student/dashboard - Get student dashboard data
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return errorResponse("Unauthorized", 401)
    if (session.role !== "STUDENT") return errorResponse("Forbidden", 403)

    const userId = session.userId || session.id

    // Check if student profile exists
    let student = await prisma.student.findUnique({
      where: { userId },
      include: {
        user: {
          select: { name: true, email: true, image: true }
        },
        classEnrollments: {
          where: { status: "APPROVED" },
          include: {
            class: {
              include: {
                teacher: {
                  include: {
                    user: { select: { name: true, email: true, image: true } }
                  }
                },
                _count: {
                  select: { enrollments: true, assignments: true, exams: true, materials: true }
                }
              }
            }
          }
        }
      }
    })

    // If student profile doesn't exist, create one
    if (!student) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return errorResponse("User not found", 404)
      }

      student = await prisma.student.create({
        data: {
          userId,
        },
        include: {
          user: {
            select: { name: true, email: true, image: true }
          },
          classEnrollments: {
            where: { status: "APPROVED" },
            include: {
              class: {
                include: {
                  teacher: {
                    include: {
                      user: { select: { name: true, email: true, image: true } }
                    }
                  },
                  _count: {
                    select: { enrollments: true, assignments: true, exams: true, materials: true }
                  }
                }
              }
            }
          }
        }
      })
    }

    const classIds = student.classEnrollments.map(e => e.class.id)

    // Get pending assignments count
    const pendingAssignments = classIds.length > 0 ? await prisma.assignment.count({
      where: {
        classId: { in: classIds },
        dueDate: { gte: new Date() },
        submissions: {
          none: { studentId: student.id }
        }
      }
    }) : 0

    // Get upcoming exams
    const upcomingExams = classIds.length > 0 ? await prisma.exam.count({
      where: {
        classId: { in: classIds },
        startTime: { gte: new Date() },
        attempts: {
          none: { studentId: student.id }
        }
      }
    }) : 0

    // Get attendance stats
    let attendanceRate = 0
    if (classIds.length > 0) {
      const attendanceSessions = await prisma.attendanceSession.findMany({
        where: { classId: { in: classIds } },
        include: {
          attendances: {
            where: { studentId: student.id }
          }
        }
      })

      const totalSessions = attendanceSessions.length
      const presentSessions = attendanceSessions.filter(
        s => s.attendances[0]?.status === "PRESENT" || s.attendances[0]?.status === "LATE"
      ).length
      attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100
    }

    // Get recent notifications
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5
    })

    // Get recent announcements
    const announcements = classIds.length > 0 ? await prisma.announcement.findMany({
      where: {
        OR: [
          { classId: { in: classIds } },
          { isGlobal: true }
        ]
      },
      include: {
        teacher: {
          include: { user: { select: { name: true } } }
        },
        class: { select: { name: true, code: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    }) : await prisma.announcement.findMany({
      where: { isGlobal: true },
      include: {
        teacher: {
          include: { user: { select: { name: true } } }
        },
        class: { select: { name: true, code: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    })

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.user.name,
          email: student.user.email,
          image: student.user.image,
          enrollmentNo: student.enrollmentNo,
          department: student.department,
          semester: student.semester,
        },
        stats: {
          enrolledClasses: student.classEnrollments.length,
          pendingAssignments,
          upcomingExams,
          attendanceRate,
        },
        classes: student.classEnrollments.map(e => ({
          id: e.class.id,
          name: e.class.name,
          code: e.class.code,
          subject: e.class.subject,
          department: e.class.department,
          semester: e.class.semester,
          teacher: {
            name: e.class.teacher.user.name,
            email: e.class.teacher.user.email,
            image: e.class.teacher.user.image,
          },
          _count: e.class._count,
          joinedAt: e.joinedAt,
        })),
        notifications,
        announcements,
      }
    })
  } catch (error) {
    console.error("Student dashboard error:", error)
    return errorResponse("Internal server error", 500)
  }
}
