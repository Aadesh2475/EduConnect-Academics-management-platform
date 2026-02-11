import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { errorResponse } from "@/lib/api/helpers"

// GET /api/student/assignments - Get student's assignments
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return errorResponse("Unauthorized", 401)
    if (session.role !== "STUDENT") return errorResponse("Forbidden", 403)

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || "all"
    const classId = searchParams.get("classId")

    const student = await prisma.student.findUnique({
      where: { userId: session.userId },
      include: {
        classEnrollments: {
          where: { status: "APPROVED" },
          select: { classId: true }
        }
      }
    })

    if (!student) return errorResponse("Student profile not found", 404)

    const classIds = classId ? [classId] : student.classEnrollments.map(e => e.classId)

    const assignments = await prisma.assignment.findMany({
      where: {
        classId: { in: classIds },
        isActive: true
      },
      include: {
        class: { select: { name: true, code: true } },
        submissions: {
          where: { studentId: student.id }
        },
        _count: { select: { submissions: true } }
      },
      orderBy: { dueDate: "asc" }
    })

    // Map assignments with status
    const now = new Date()
    const assignmentsWithStatus = assignments.map(a => {
      const submission = a.submissions[0]
      let assignmentStatus: string

      if (submission) {
        if (submission.marks !== null) {
          assignmentStatus = "GRADED"
        } else if (submission.status === "LATE") {
          assignmentStatus = "LATE"
        } else {
          assignmentStatus = "SUBMITTED"
        }
      } else if (new Date(a.dueDate) < now) {
        assignmentStatus = "OVERDUE"
      } else {
        assignmentStatus = "PENDING"
      }

      return {
        id: a.id,
        title: a.title,
        description: a.description,
        instructions: a.instructions,
        className: a.class.name,
        classCode: a.class.code,
        dueDate: a.dueDate,
        totalMarks: a.totalMarks,
        attachments: a.attachments,
        status: assignmentStatus,
        submittedAt: submission?.submittedAt,
        marks: submission?.marks,
        feedback: submission?.feedback,
      }
    })

    // Filter by status if specified
    const filteredAssignments = status === "all" 
      ? assignmentsWithStatus 
      : assignmentsWithStatus.filter(a => a.status === status)

    // Calculate stats
    const stats = {
      total: assignmentsWithStatus.length,
      pending: assignmentsWithStatus.filter(a => a.status === "PENDING").length,
      submitted: assignmentsWithStatus.filter(a => a.status === "SUBMITTED").length,
      graded: assignmentsWithStatus.filter(a => a.status === "GRADED" || a.status === "LATE").length,
      overdue: assignmentsWithStatus.filter(a => a.status === "OVERDUE").length,
      avgScore: (() => {
        const graded = assignmentsWithStatus.filter(a => a.marks !== null && a.marks !== undefined)
        if (graded.length === 0) return 0
        const totalPercent = graded.reduce((acc, a) => acc + ((a.marks! / a.totalMarks) * 100), 0)
        return Math.round(totalPercent / graded.length)
      })()
    }

    return NextResponse.json({
      success: true,
      data: filteredAssignments,
      stats
    })
  } catch (error) {
    console.error("Student assignments error:", error)
    return errorResponse("Internal server error", 500)
  }
}
