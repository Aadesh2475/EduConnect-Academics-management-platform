import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { errorResponse } from "@/lib/api/helpers"

// GET /api/student/attendance - Get student's attendance records
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return errorResponse("Unauthorized", 401)
    if (session.role !== "STUDENT") return errorResponse("Forbidden", 403)

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")
    const month = searchParams.get("month")
    const year = searchParams.get("year")

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

    // Build date filter
    let dateFilter = {}
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0)
      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    }

    const sessions = await prisma.attendanceSession.findMany({
      where: {
        classId: { in: classIds },
        ...dateFilter
      },
      include: {
        class: { select: { name: true, code: true } },
        attendances: {
          where: { studentId: student.id }
        }
      },
      orderBy: { date: "desc" }
    })

    const records = sessions.map(s => ({
      id: s.id,
      date: s.date,
      className: s.class.name,
      classCode: s.class.code,
      topic: s.topic,
      status: s.attendances[0]?.status || "ABSENT",
      remarks: s.attendances[0]?.remarks
    }))

    // Calculate stats
    const total = records.length
    const present = records.filter(r => r.status === "PRESENT").length
    const absent = records.filter(r => r.status === "ABSENT").length
    const late = records.filter(r => r.status === "LATE").length
    const excused = records.filter(r => r.status === "EXCUSED").length
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0

    return NextResponse.json({
      success: true,
      data: {
        records,
        stats: { total, present, absent, late, excused, rate }
      }
    })
  } catch (error) {
    console.error("Student attendance error:", error)
    return errorResponse("Internal server error", 500)
  }
}
