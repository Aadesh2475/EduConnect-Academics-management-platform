import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { errorResponse, parsePagination } from "@/lib/api/helpers"

// GET /api/teacher/assignments - Get all assignments for teacher's classes
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return errorResponse("Unauthorized", 401)
    if (session.role !== "TEACHER") return errorResponse("Forbidden", 403)

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")
    const status = searchParams.get("status") // active, past, all

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.userId }
    })

    if (!teacher) return errorResponse("Teacher profile not found", 404)

    // Get teacher's class IDs
    const teacherClasses = await prisma.class.findMany({
      where: { teacherId: teacher.id },
      select: { id: true }
    })
    const classIds = classId ? [classId] : teacherClasses.map(c => c.id)

    const now = new Date()
    let dateFilter = {}
    if (status === "active") {
      dateFilter = { dueDate: { gte: now } }
    } else if (status === "past") {
      dateFilter = { dueDate: { lt: now } }
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        classId: { in: classIds },
        ...dateFilter
      },
      include: {
        class: { select: { name: true, code: true } },
        _count: { select: { submissions: true } }
      },
      orderBy: { dueDate: "asc" }
    })

    // Get submission stats for each assignment
    const assignmentsWithStats = await Promise.all(
      assignments.map(async (a) => {
        const totalStudents = await prisma.classEnrollment.count({
          where: { classId: a.classId, status: "APPROVED" }
        })
        
        const gradedSubmissions = await prisma.submission.count({
          where: { assignmentId: a.id, marks: { not: null } }
        })

        const pendingSubmissions = await prisma.submission.count({
          where: { assignmentId: a.id, marks: null }
        })

        return {
          id: a.id,
          title: a.title,
          description: a.description,
          instructions: a.instructions,
          className: a.class.name,
          classCode: a.class.code,
          classId: a.classId,
          dueDate: a.dueDate,
          totalMarks: a.totalMarks,
          attachments: a.attachments,
          isActive: a.isActive,
          createdAt: a.createdAt,
          stats: {
            totalStudents,
            submitted: a._count.submissions,
            graded: gradedSubmissions,
            pending: pendingSubmissions,
            notSubmitted: totalStudents - a._count.submissions,
            submissionRate: totalStudents > 0 
              ? Math.round((a._count.submissions / totalStudents) * 100) 
              : 0
          }
        }
      })
    )

    // Overall stats
    const stats = {
      total: assignmentsWithStats.length,
      active: assignmentsWithStats.filter(a => new Date(a.dueDate) >= now).length,
      past: assignmentsWithStats.filter(a => new Date(a.dueDate) < now).length,
      totalPending: assignmentsWithStats.reduce((acc, a) => acc + a.stats.pending, 0)
    }

    return NextResponse.json({
      success: true,
      data: assignmentsWithStats,
      stats
    })
  } catch (error) {
    console.error("Teacher assignments error:", error)
    return errorResponse("Internal server error", 500)
  }
}

// POST /api/teacher/assignments - Create a new assignment
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return errorResponse("Unauthorized", 401)
    if (session.role !== "TEACHER") return errorResponse("Forbidden", 403)

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.userId }
    })

    if (!teacher) return errorResponse("Teacher profile not found", 404)

    const body = await req.json()
    const { classId, title, description, instructions, dueDate, totalMarks, attachments } = body

    if (!classId || !title || !dueDate || !totalMarks) {
      return errorResponse("Missing required fields", 400)
    }

    // Verify teacher owns the class
    const classExists = await prisma.class.findFirst({
      where: { id: classId, teacherId: teacher.id }
    })

    if (!classExists) {
      return errorResponse("Class not found or access denied", 403)
    }

    const assignment = await prisma.assignment.create({
      data: {
        classId,
        title,
        description,
        instructions,
        dueDate: new Date(dueDate),
        totalMarks: parseInt(totalMarks),
        attachments: attachments || [],
        isActive: true
      },
      include: {
        class: { select: { name: true, code: true } }
      }
    })

    // Create notification for enrolled students
    const enrollments = await prisma.classEnrollment.findMany({
      where: { classId, status: "APPROVED" },
      include: { student: { select: { userId: true } } }
    })

    await prisma.notification.createMany({
      data: enrollments.map(e => ({
        userId: e.student.userId,
        title: "New Assignment",
        message: `New assignment "${title}" has been posted in ${classExists.name}`,
        type: "info",
        link: `/dashboard/student/assignments`
      }))
    })

    return NextResponse.json({
      success: true,
      data: assignment,
      message: "Assignment created successfully"
    })
  } catch (error) {
    console.error("Create assignment error:", error)
    return errorResponse("Internal server error", 500)
  }
}
