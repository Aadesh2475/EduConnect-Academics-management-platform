import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"

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

// POST - Submit assignment (Student)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can submit assignments" }, { status: 403 })
    }

    const body = await request.json()
    const { assignmentId, content, attachments } = body

    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID required" }, { status: 400 })
    }

    const student = await prisma.student.findUnique({ where: { userId: user.id } })
    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    }

    // Verify assignment exists and student is enrolled
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { class: true }
    })

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    const enrollment = await prisma.classEnrollment.findUnique({
      where: {
        classId_studentId: {
          classId: assignment.classId,
          studentId: student.id
        }
      }
    })

    if (!enrollment || enrollment.status !== "APPROVED") {
      return NextResponse.json({ error: "Not enrolled in this class" }, { status: 403 })
    }

    // Check if already submitted
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: student.id
        }
      }
    })

    const now = new Date()
    const isLate = now > assignment.dueDate

    if (existingSubmission) {
      // Update existing submission
      const updated = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          content,
          attachments: attachments ? JSON.stringify(attachments) : null,
          status: isLate ? "LATE" : "SUBMITTED",
          submittedAt: now
        }
      })

      return NextResponse.json({
        success: true,
        message: isLate ? "Assignment resubmitted (late)" : "Assignment resubmitted",
        data: updated
      })
    }

    // Create new submission
    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: student.id,
        content,
        attachments: attachments ? JSON.stringify(attachments) : null,
        status: isLate ? "LATE" : "SUBMITTED",
        submittedAt: now
      }
    })

    // Notify teacher
    const classWithTeacher = await prisma.class.findUnique({
      where: { id: assignment.classId },
      include: { teacher: { include: { user: true } } }
    })

    if (classWithTeacher) {
      await prisma.notification.create({
        data: {
          userId: classWithTeacher.teacher.userId,
          title: "New Submission",
          message: `${user.name} submitted ${assignment.title}${isLate ? ' (late)' : ''}`,
          type: "info",
          link: `/dashboard/teacher/assignments/${assignmentId}/submissions`
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: isLate ? "Assignment submitted (late)" : "Assignment submitted successfully",
      data: submission
    }, { status: 201 })
  } catch (error) {
    console.error("Error submitting assignment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Get student's submissions
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get("assignmentId")

    if (user.role === "STUDENT") {
      const student = await prisma.student.findUnique({ where: { userId: user.id } })
      if (!student) {
        return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
      }

      let where: any = { studentId: student.id }
      if (assignmentId) where.assignmentId = assignmentId

      const submissions = await prisma.submission.findMany({
        where,
        include: {
          assignment: {
            include: {
              class: { select: { name: true, subject: true } }
            }
          }
        },
        orderBy: { submittedAt: "desc" }
      })

      return NextResponse.json({ success: true, data: submissions })
    } else {
      // Teacher view - get all submissions for an assignment
      if (!assignmentId) {
        return NextResponse.json({ error: "Assignment ID required for teacher" }, { status: 400 })
      }

      const submissions = await prisma.submission.findMany({
        where: { assignmentId },
        include: {
          student: { include: { user: { select: { name: true, email: true, image: true } } } },
          assignment: true
        },
        orderBy: { submittedAt: "desc" }
      })

      return NextResponse.json({ success: true, data: submissions })
    }
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
