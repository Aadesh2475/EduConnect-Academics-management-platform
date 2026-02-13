import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { errorResponse } from "@/lib/api/helpers"

// GET /api/admin/dashboard - Get admin dashboard data
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return errorResponse("Unauthorized", 401)
    if (session.role !== "ADMIN") return errorResponse("Forbidden", 403)

    // Get overall statistics
    const [
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalClasses,
      totalAssignments,
      totalExams,
      recentUsers,
      recentClasses,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.class.count(),
      prisma.assignment.count(),
      prisma.exam.count(),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        }
      }),
      prisma.class.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          teacher: {
            include: {
              user: { select: { name: true } }
            }
          },
          _count: { select: { enrollments: true } }
        }
      }),
    ])

    // Calculate monthly growth
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [newStudentsThisMonth, newTeachersThisMonth] = await Promise.all([
      prisma.student.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.teacher.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
    ])

    // Get recent activity
    const recentActivity = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalTeachers,
          totalAdmins,
          totalClasses,
          totalAssignments,
          totalExams,
          activeUsers: Math.floor((totalStudents + totalTeachers) * 0.4), // Estimate
        },
        growth: {
          studentsThisMonth: newStudentsThisMonth,
          teachersThisMonth: newTeachersThisMonth,
          studentGrowthRate: totalStudents > 0 ? ((newStudentsThisMonth / totalStudents) * 100).toFixed(1) : 0,
          teacherGrowthRate: totalTeachers > 0 ? ((newTeachersThisMonth / totalTeachers) * 100).toFixed(1) : 0,
        },
        recentUsers: recentUsers.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: "active", // Default status
          joinedAt: user.createdAt,
        })),
        recentClasses: recentClasses.map(cls => ({
          id: cls.id,
          name: cls.name,
          code: cls.code,
          teacherName: cls.teacher?.user?.name || "Unknown",
          studentCount: cls._count.enrollments,
          createdAt: cls.createdAt,
        })),
        roleDistribution: [
          { name: "Students", value: totalStudents, color: "#3b82f6" },
          { name: "Teachers", value: totalTeachers, color: "#8b5cf6" },
          { name: "Admins", value: totalAdmins, color: "#ef4444" },
        ],
        recentActivity,
      }
    })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    return errorResponse("Internal server error", 500)
  }
}
