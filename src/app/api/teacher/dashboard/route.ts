import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.role !== "TEACHER") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Teacher access only" },
        { status: 403 }
      );
    }

    // Get teacher profile with classes
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.id },
      include: {
        classes: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                enrollments: { where: { status: "APPROVED" } },
                assignments: true,
                exams: true,
                materials: true,
              }
            },
            enrollments: {
              where: { status: "APPROVED" },
              take: 5,
              include: {
                student: {
                  include: { user: { select: { name: true, email: true, image: true } } }
                }
              }
            }
          }
        },
        announcements: {
          orderBy: { createdAt: "desc" },
          take: 5,
        }
      }
    });

    if (!teacher) {
      return NextResponse.json({
        success: true,
        data: {
          teacher: {
            id: null,
            name: session.name,
            email: session.email,
            department: null,
            subject: null,
            university: null,
          },
          stats: {
            totalClasses: 0,
            totalStudents: 0,
            pendingSubmissions: 0,
            upcomingExams: 0,
          },
          classes: [],
          recentSubmissions: [],
          upcomingExams: [],
          announcements: [],
          notifications: [],
        },
      });
    }

    const classIds = teacher.classes.map(c => c.id);

    // Get pending submissions count
    const pendingSubmissions = classIds.length > 0 ? await prisma.submission.count({
      where: {
        assignment: { classId: { in: classIds } },
        status: { in: ["SUBMITTED", "PENDING"] },
      }
    }) : 0;

    // Get recent submissions
    const recentSubmissions = classIds.length > 0 ? await prisma.submission.findMany({
      where: {
        assignment: { classId: { in: classIds } },
        status: { in: ["SUBMITTED", "PENDING"] },
      },
      orderBy: { submittedAt: "desc" },
      take: 10,
      include: {
        assignment: { select: { title: true, totalMarks: true } },
        student: {
          include: { user: { select: { name: true, email: true } } }
        }
      }
    }) : [];

    // Get upcoming exams
    const upcomingExams = classIds.length > 0 ? await prisma.exam.findMany({
      where: {
        classId: { in: classIds },
        startTime: { gte: new Date() },
        isActive: true,
      },
      orderBy: { startTime: "asc" },
      take: 5,
      include: {
        class: { select: { name: true, subject: true } },
        _count: { select: { attempts: true } }
      }
    }) : [];

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Calculate total students
    const totalStudents = teacher.classes.reduce(
      (sum, c) => sum + c._count.enrollments, 0
    );

    return NextResponse.json({
      success: true,
      data: {
        teacher: {
          id: teacher.id,
          name: session.name,
          email: session.email,
          employeeId: teacher.employeeId,
          department: teacher.department,
          subject: teacher.subject,
          university: teacher.university,
          phone: teacher.phone,
          qualification: teacher.qualification,
          experience: teacher.experience,
        },
        stats: {
          totalClasses: teacher.classes.length,
          totalStudents,
          pendingSubmissions,
          upcomingExams: upcomingExams.length,
        },
        classes: teacher.classes.map(c => ({
          id: c.id,
          name: c.name,
          code: c.code,
          subject: c.subject,
          department: c.department,
          semester: c.semester,
          studentCount: c._count.enrollments,
          assignmentCount: c._count.assignments,
          examCount: c._count.exams,
          materialCount: c._count.materials,
          recentStudents: c.enrollments.map(e => ({
            id: e.student.id,
            name: e.student.user.name,
            email: e.student.user.email,
            image: e.student.user.image,
          })),
        })),
        recentSubmissions: recentSubmissions.map(s => ({
          id: s.id,
          assignmentTitle: s.assignment.title,
          studentName: s.student.user.name,
          studentEmail: s.student.user.email,
          status: s.status,
          submittedAt: s.submittedAt,
          marks: s.marks,
          totalMarks: s.assignment.totalMarks,
        })),
        upcomingExams: upcomingExams.map(e => ({
          id: e.id,
          title: e.title,
          type: e.type,
          startTime: e.startTime,
          endTime: e.endTime,
          duration: e.duration,
          className: e.class.name,
          subject: e.class.subject,
          attemptCount: e._count.attempts,
        })),
        announcements: teacher.announcements.map(a => ({
          id: a.id,
          title: a.title,
          content: a.content,
          priority: a.priority,
          isGlobal: a.isGlobal,
          createdAt: a.createdAt,
        })),
        notifications: notifications.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          read: n.read,
          createdAt: n.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Teacher dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
