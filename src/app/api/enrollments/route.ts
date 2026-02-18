import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

// GET - Get enrollment requests (for teachers) or enrolled classes (for students)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const status = searchParams.get("status") || "all";

    if (session.role === "TEACHER") {
      // Get enrollment requests for teacher's classes
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.id },
      });

      if (!teacher) {
        return NextResponse.json({ success: true, data: [] });
      }

      const whereClause: Record<string, unknown> = {
        class: { teacherId: teacher.id },
      };

      if (classId) {
        whereClause.classId = classId;
      }

      if (status !== "all") {
        whereClause.status = status.toUpperCase();
      }

      const enrollments = await prisma.classEnrollment.findMany({
        where: whereClause,
        include: {
          student: {
            include: { user: { select: { name: true, email: true, image: true } } },
          },
          class: { select: { name: true, code: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        data: enrollments.map((e) => ({
          id: e.id,
          studentId: e.studentId,
          studentName: e.student.user.name,
          studentEmail: e.student.user.email,
          studentImage: e.student.user.image,
          classId: e.classId,
          className: e.class.name,
          classCode: e.class.code,
          status: e.status,
          joinedAt: e.joinedAt,
          createdAt: e.createdAt,
        })),
      });
    } else if (session.role === "STUDENT") {
      // Get student's enrollments
      const student = await prisma.student.findUnique({
        where: { userId: session.id },
      });

      if (!student) {
        return NextResponse.json({ success: true, data: [] });
      }

      const whereClause: Record<string, unknown> = { studentId: student.id };
      if (status !== "all") {
        whereClause.status = status.toUpperCase();
      }

      const enrollments = await prisma.classEnrollment.findMany({
        where: whereClause,
        include: {
          class: {
            include: {
              teacher: {
                include: { user: { select: { name: true, image: true } } },
              },
              _count: {
                select: { enrollments: { where: { status: "APPROVED" } } },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        data: enrollments.map((e) => ({
          id: e.id,
          classId: e.classId,
          className: e.class.name,
          classCode: e.class.code,
          subject: e.class.subject,
          department: e.class.department,
          teacherName: e.class.teacher.user.name,
          teacherImage: e.class.teacher.user.image,
          studentCount: e.class._count.enrollments,
          status: e.status,
          joinedAt: e.joinedAt,
          createdAt: e.createdAt,
        })),
      });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("Get enrollments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}

// POST - Request to join a class (Students) or add student to class (Teachers)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { classId, classCode, studentId } = body;

    if (session.role === "STUDENT") {
      // Student requesting to join a class
      const student = await prisma.student.findUnique({
        where: { userId: session.id },
      });

      if (!student) {
        return NextResponse.json(
          { success: false, error: "Student profile not found" },
          { status: 404 }
        );
      }

      // Find class by ID or code
      let classData;
      if (classId) {
        classData = await prisma.class.findUnique({ where: { id: classId } });
      } else if (classCode) {
        classData = await prisma.class.findUnique({ where: { code: classCode.toUpperCase() } });
      }

      if (!classData) {
        return NextResponse.json(
          { success: false, error: "Class not found" },
          { status: 404 }
        );
      }

      if (!classData.isActive) {
        return NextResponse.json(
          { success: false, error: "This class is not accepting new students" },
          { status: 400 }
        );
      }

      // Check if already enrolled or requested
      const existing = await prisma.classEnrollment.findUnique({
        where: {
          classId_studentId: { classId: classData.id, studentId: student.id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { success: false, error: `You have already ${existing.status === "PENDING" ? "requested to join" : "joined"} this class` },
          { status: 400 }
        );
      }

      const enrollment = await prisma.classEnrollment.create({
        data: {
          classId: classData.id,
          studentId: student.id,
          status: "PENDING",
        },
      });

      // Notify teacher
      const classWithTeacher = await prisma.class.findUnique({
        where: { id: classData.id },
        include: { teacher: { include: { user: true } } },
      });

      if (classWithTeacher) {
        await prisma.notification.create({
          data: {
            userId: classWithTeacher.teacher.userId,
            title: "New Join Request",
            message: `${session.name} has requested to join ${classData.name}`,
            type: "info",
            link: `/dashboard/teacher/classes/${classData.id}/requests`,
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: enrollment,
        message: "Join request sent successfully",
      });
    } else if (session.role === "TEACHER") {
      // Teacher adding a student directly
      if (!classId || !studentId) {
        return NextResponse.json(
          { success: false, error: "Class ID and Student ID are required" },
          { status: 400 }
        );
      }

      // Verify teacher owns the class
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: { teacher: true },
      });

      if (!classData || classData.teacher.userId !== session.id) {
        return NextResponse.json(
          { success: false, error: "Class not found or unauthorized" },
          { status: 404 }
        );
      }

      const enrollment = await prisma.classEnrollment.upsert({
        where: {
          classId_studentId: { classId, studentId },
        },
        update: {
          status: "APPROVED",
          joinedAt: new Date(),
        },
        create: {
          classId,
          studentId,
          status: "APPROVED",
          joinedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: enrollment,
        message: "Student added to class successfully",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid operation" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Create enrollment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process enrollment" },
      { status: 500 }
    );
  }
}

// PUT - Update enrollment status (Accept/Reject)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "TEACHER" && session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only teachers can manage enrollments" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { enrollmentId, status } = body;

    if (!enrollmentId || !status) {
      return NextResponse.json(
        { success: false, error: "Enrollment ID and status are required" },
        { status: 400 }
      );
    }

    if (!["APPROVED", "REJECTED"].includes(status.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: "Status must be APPROVED or REJECTED" },
        { status: 400 }
      );
    }

    // Verify ownership
    const enrollment = await prisma.classEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        class: { include: { teacher: true } },
        student: { include: { user: true } },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" },
        { status: 404 }
      );
    }

    if (session.role === "TEACHER" && enrollment.class.teacher.userId !== session.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to manage this enrollment" },
        { status: 403 }
      );
    }

    const updatedEnrollment = await prisma.classEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: status.toUpperCase(),
        joinedAt: status.toUpperCase() === "APPROVED" ? new Date() : null,
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: enrollment.student.userId,
        title: status.toUpperCase() === "APPROVED" ? "Request Approved" : "Request Rejected",
        message:
          status.toUpperCase() === "APPROVED"
            ? `Your request to join ${enrollment.class.name} has been approved!`
            : `Your request to join ${enrollment.class.name} has been rejected.`,
        type: status.toUpperCase() === "APPROVED" ? "success" : "warning",
        link:
          status.toUpperCase() === "APPROVED"
            ? `/dashboard/student/classes/${enrollment.classId}`
            : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedEnrollment,
      message: `Enrollment ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error("Update enrollment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update enrollment" },
      { status: 500 }
    );
  }
}

// DELETE - Remove enrollment (leave class or remove student)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get("id");

    if (!enrollmentId) {
      return NextResponse.json(
        { success: false, error: "Enrollment ID is required" },
        { status: 400 }
      );
    }

    const enrollment = await prisma.classEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        class: { include: { teacher: true } },
        student: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Check authorization
    const isTeacher = session.role === "TEACHER" && enrollment.class.teacher.userId === session.id;
    const isStudent = session.role === "STUDENT" && enrollment.student.userId === session.id;
    const isAdmin = session.role === "ADMIN";

    if (!isTeacher && !isStudent && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to remove this enrollment" },
        { status: 403 }
      );
    }

    await prisma.classEnrollment.delete({ where: { id: enrollmentId } });

    return NextResponse.json({
      success: true,
      message: "Enrollment removed successfully",
    });
  } catch (error) {
    console.error("Delete enrollment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove enrollment" },
      { status: 500 }
    );
  }
}
