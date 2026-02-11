import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { errorResponse } from "@/lib/api/helpers"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/teacher/classes/[id]/students - Get enrolled students
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) return errorResponse("Unauthorized", 401)
    if (session.role !== "TEACHER") return errorResponse("Forbidden", 403)

    const { id: classId } = await params

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.userId },
      include: {
        classes: { where: { id: classId } }
      }
    })

    if (!teacher || teacher.classes.length === 0) {
      return errorResponse("Class not found or access denied", 403)
    }

    const enrollments = await prisma.classEnrollment.findMany({
      where: {
        classId,
        status: "APPROVED"
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true, image: true } },
            submissions: {
              where: { assignment: { classId } }
            },
            examAttempts: {
              where: { exam: { classId } }
            },
            attendances: {
              where: { session: { classId } }
            }
          }
        }
      },
      orderBy: { joinedAt: "desc" }
    })

    // Calculate stats for each student
    const studentsWithStats = await Promise.all(
      enrollments.map(async (e) => {
        // Get total assignments for this class
        const totalAssignments = await prisma.assignment.count({ where: { classId } })
        const submittedAssignments = e.student.submissions.length
        
        // Get total exams
        const totalExams = await prisma.exam.count({ where: { classId } })
        const attemptedExams = e.student.examAttempts.length

        // Get total attendance sessions
        const totalSessions = await prisma.attendanceSession.count({ where: { classId } })
        const presentSessions = e.student.attendances.filter(
          a => a.status === "PRESENT" || a.status === "LATE"
        ).length

        // Calculate averages
        const avgAssignmentScore = (() => {
          const graded = e.student.submissions.filter(s => s.marks !== null)
          if (graded.length === 0) return null
          return Math.round(graded.reduce((acc, s) => acc + (s.marks || 0), 0) / graded.length)
        })()

        const avgExamScore = (() => {
          const completed = e.student.examAttempts.filter(a => a.obtainedMarks !== null)
          if (completed.length === 0) return null
          return Math.round(completed.reduce((acc, a) => acc + (a.percentage || 0), 0) / completed.length)
        })()

        return {
          id: e.student.id,
          name: e.student.user.name,
          email: e.student.user.email,
          image: e.student.user.image,
          enrollmentNo: e.student.enrollmentNo,
          department: e.student.department,
          semester: e.student.semester,
          joinedAt: e.joinedAt,
          stats: {
            assignmentsCompleted: `${submittedAssignments}/${totalAssignments}`,
            examsAttempted: `${attemptedExams}/${totalExams}`,
            attendanceRate: totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0,
            avgAssignmentScore,
            avgExamScore,
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: studentsWithStats
    })
  } catch (error) {
    console.error("Get students error:", error)
    return errorResponse("Internal server error", 500)
  }
}
