import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { errorResponse, parsePagination } from "@/lib/api/helpers"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return errorResponse("Unauthorized", 401)

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: Record<string, unknown> = {}

    if (session.role === "STUDENT") {
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

      const sessions = await prisma.attendanceSession.findMany({
        where: {
          classId: {
            in: student.classEnrollments.map(e => e.classId)
          },
          ...(startDate && endDate ? {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          } : {}),
          ...(classId ? { classId } : {})
        },
        include: {
          class: { select: { name: true, code: true } },
          attendances: {
            where: { studentId: student.id }
          }
        },
        orderBy: { date: "desc" }
      })

      const attendanceData = sessions.map(s => ({
        id: s.id,
        date: s.date,
        className: s.class.name,
        classCode: s.class.code,
        topic: s.topic,
        status: s.attendances[0]?.status || "ABSENT",
        remarks: s.attendances[0]?.remarks,
      }))

      // Calculate stats
      const total = attendanceData.length
      const present = attendanceData.filter(a => a.status === "PRESENT").length
      const absent = attendanceData.filter(a => a.status === "ABSENT").length
      const late = attendanceData.filter(a => a.status === "LATE").length
      const excused = attendanceData.filter(a => a.status === "EXCUSED").length

      return NextResponse.json({
        success: true,
        data: {
          records: attendanceData,
          stats: {
            total,
            present,
            absent,
            late,
            excused,
            rate: total > 0 ? Math.round(((present + late) / total) * 100) : 0
          }
        }
      })
    }

    // For teachers
    if (session.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.userId },
        include: {
          classes: { select: { id: true } }
        }
      })

      if (!teacher) return errorResponse("Teacher profile not found", 404)

      const sessions = await prisma.attendanceSession.findMany({
        where: {
          classId: classId || {
            in: teacher.classes.map(c => c.id)
          }
        },
        include: {
          class: { select: { name: true, code: true } },
          _count: { select: { attendances: true } }
        },
        orderBy: { date: "desc" }
      })

      return NextResponse.json({ success: true, data: sessions })
    }

    return errorResponse("Invalid role", 400)
  } catch (error) {
    console.error("Get attendance error:", error)
    return errorResponse("Internal server error", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "TEACHER") {
      return errorResponse("Forbidden", 403)
    }

    const body = await req.json()
    const { classId, date, topic, attendances } = body

    if (!classId || !date || !attendances) {
      return errorResponse("Missing required fields", 400)
    }

    // Verify teacher owns this class
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.userId },
      include: {
        classes: { where: { id: classId } }
      }
    })

    if (!teacher || teacher.classes.length === 0) {
      return errorResponse("Class not found or access denied", 403)
    }

    // Create or update attendance session
    const attendanceSession = await prisma.attendanceSession.upsert({
      where: {
        classId_date: {
          classId,
          date: new Date(date)
        }
      },
      create: {
        classId,
        date: new Date(date),
        topic,
      },
      update: { topic }
    })

    // Create attendance records
    for (const att of attendances) {
      await prisma.attendance.upsert({
        where: {
          sessionId_studentId: {
            sessionId: attendanceSession.id,
            studentId: att.studentId,
          }
        },
        create: {
          sessionId: attendanceSession.id,
          studentId: att.studentId,
          status: att.status,
          remarks: att.remarks,
        },
        update: {
          status: att.status,
          remarks: att.remarks,
        }
      })
    }

    return NextResponse.json({ success: true, data: attendanceSession })
  } catch (error) {
    console.error("Mark attendance error:", error)
    return errorResponse("Internal server error", 500)
  }
}
