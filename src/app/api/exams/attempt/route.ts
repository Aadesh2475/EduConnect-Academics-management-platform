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

// POST - Start exam attempt (Student)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can attempt exams" }, { status: 403 })
    }

    const body = await request.json()
    const { examId } = body

    if (!examId) {
      return NextResponse.json({ error: "Exam ID required" }, { status: 400 })
    }

    const student = await prisma.student.findUnique({ where: { userId: user.id } })
    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    }

    // Verify exam exists and is active
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        class: true,
        questions: { orderBy: { order: "asc" } }
      }
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // Check time window
    const now = new Date()
    if (now < exam.startTime) {
      return NextResponse.json({ error: "Exam has not started yet" }, { status: 400 })
    }
    if (now > exam.endTime) {
      return NextResponse.json({ error: "Exam has ended" }, { status: 400 })
    }

    // Check enrollment
    const enrollment = await prisma.classEnrollment.findUnique({
      where: {
        classId_studentId: {
          classId: exam.classId,
          studentId: student.id
        }
      }
    })

    if (!enrollment || enrollment.status !== "APPROVED") {
      return NextResponse.json({ error: "Not enrolled in this class" }, { status: 403 })
    }

    // Check for existing attempt
    const existingAttempt = await prisma.examAttempt.findUnique({
      where: {
        examId_studentId: {
          examId,
          studentId: student.id
        }
      }
    })

    if (existingAttempt) {
      if (existingAttempt.status === "SUBMITTED" || existingAttempt.status === "GRADED") {
        return NextResponse.json({ error: "You have already completed this exam" }, { status: 400 })
      }
      
      // Return existing in-progress attempt with questions
      const questions = exam.shuffleQuestions 
        ? shuffleArray([...exam.questions])
        : exam.questions

      return NextResponse.json({
        success: true,
        data: {
          attempt: existingAttempt,
          exam: {
            ...exam,
            questions: questions.map(q => ({
              id: q.id,
              type: q.type,
              question: q.question,
              options: q.options ? JSON.parse(q.options) : null,
              marks: q.marks
            }))
          }
        }
      })
    }

    // Create new attempt
    const attempt = await prisma.examAttempt.create({
      data: {
        examId,
        studentId: student.id,
        totalMarks: exam.totalMarks,
        status: "IN_PROGRESS"
      }
    })

    const questions = exam.shuffleQuestions 
      ? shuffleArray([...exam.questions])
      : exam.questions

    return NextResponse.json({
      success: true,
      data: {
        attempt,
        exam: {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          duration: exam.duration,
          totalMarks: exam.totalMarks,
          endTime: exam.endTime,
          questions: questions.map(q => ({
            id: q.id,
            type: q.type,
            question: q.question,
            options: q.options ? JSON.parse(q.options) : null,
            marks: q.marks
          }))
        }
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Error starting exam:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Submit answers / Complete exam
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can submit exams" }, { status: 403 })
    }

    const body = await request.json()
    const { attemptId, answers, submit } = body

    if (!attemptId) {
      return NextResponse.json({ error: "Attempt ID required" }, { status: 400 })
    }

    const student = await prisma.student.findUnique({ where: { userId: user.id } })
    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: { include: { questions: true } }
      }
    })

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
    }

    if (attempt.studentId !== student.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Exam already submitted" }, { status: 400 })
    }

    // Save answers
    if (answers && Array.isArray(answers)) {
      for (const ans of answers) {
        await prisma.questionAnswer.upsert({
          where: {
            attemptId_questionId: {
              attemptId,
              questionId: ans.questionId
            }
          },
          update: { answer: ans.answer },
          create: {
            attemptId,
            questionId: ans.questionId,
            answer: ans.answer
          }
        })
      }
    }

    // If submitting, grade the exam
    if (submit) {
      let obtainedMarks = 0

      // Auto-grade MCQ and TRUE_FALSE questions
      const allAnswers = await prisma.questionAnswer.findMany({
        where: { attemptId },
        include: { question: true }
      })

      for (const ans of allAnswers) {
        if (["MCQ", "TRUE_FALSE"].includes(ans.question.type)) {
          const isCorrect = ans.answer === ans.question.answer
          const marks = isCorrect ? ans.question.marks : 0
          obtainedMarks += marks

          await prisma.questionAnswer.update({
            where: { id: ans.id },
            data: {
              isCorrect,
              marksAwarded: marks
            }
          })
        }
      }

      const percentage = (obtainedMarks / attempt.exam.totalMarks) * 100

      const updatedAttempt = await prisma.examAttempt.update({
        where: { id: attemptId },
        data: {
          status: "SUBMITTED",
          submittedAt: new Date(),
          obtainedMarks,
          percentage
        }
      })

      // Notify teacher
      const classWithTeacher = await prisma.class.findUnique({
        where: { id: attempt.exam.classId },
        include: { teacher: { include: { user: true } } }
      })

      if (classWithTeacher) {
        await prisma.notification.create({
          data: {
            userId: classWithTeacher.teacher.userId,
            title: "Exam Submission",
            message: `${user.name} submitted ${attempt.exam.title}`,
            type: "info"
          }
        })
      }

      return NextResponse.json({
        success: true,
        message: "Exam submitted",
        data: {
          ...updatedAttempt,
          showResults: attempt.exam.showResults,
          results: attempt.exam.showResults ? {
            obtainedMarks,
            totalMarks: attempt.exam.totalMarks,
            percentage,
            passed: attempt.exam.passingMarks ? obtainedMarks >= attempt.exam.passingMarks : null
          } : null
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "Answers saved"
    })
  } catch (error) {
    console.error("Error submitting exam:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Get attempt details / results
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const attemptId = searchParams.get("attemptId")
    const examId = searchParams.get("examId")

    if (user.role === "STUDENT") {
      const student = await prisma.student.findUnique({ where: { userId: user.id } })
      if (!student) {
        return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
      }

      if (attemptId) {
        const attempt = await prisma.examAttempt.findUnique({
          where: { id: attemptId },
          include: {
            exam: true,
            answers: {
              include: {
                question: true
              }
            }
          }
        })

        if (!attempt || attempt.studentId !== student.id) {
          return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 })
        }

        return NextResponse.json({ success: true, data: attempt })
      }

      // Get all attempts for student
      const attempts = await prisma.examAttempt.findMany({
        where: { studentId: student.id },
        include: {
          exam: { include: { class: { select: { name: true } } } }
        },
        orderBy: { createdAt: "desc" }
      })

      return NextResponse.json({ success: true, data: attempts })
    } else {
      // Teacher view
      if (!examId) {
        return NextResponse.json({ error: "Exam ID required" }, { status: 400 })
      }

      const attempts = await prisma.examAttempt.findMany({
        where: { examId },
        include: {
          student: { include: { user: { select: { name: true, email: true } } } },
          answers: { include: { question: true } }
        },
        orderBy: { submittedAt: "desc" }
      })

      return NextResponse.json({ success: true, data: attempts })
    }
  } catch (error) {
    console.error("Error fetching attempts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
