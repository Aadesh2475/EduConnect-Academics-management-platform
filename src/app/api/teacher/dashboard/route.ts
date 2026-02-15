import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // Get user info from cookie
    const userInfo = req.cookies.get("user_info")?.value
    
    if (!userInfo) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 })
    }

    const user = JSON.parse(userInfo)
    
    if (user.role !== "TEACHER") {
      return NextResponse.json({ 
        success: false, 
        error: "Forbidden" 
      }, { status: 403 })
    }

    // Return mock dashboard data
    const dashboardData = {
      teacher: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: "Computer Science",
        subject: "Programming",
        university: "Demo University",
        phone: "123-456-7890",
        avatar: null,
      },
      stats: {
        totalClasses: 5,
        totalStudents: 156,
        pendingRequests: 8,
        pendingGrading: 12,
      },
      classes: [
        {
          id: "class-1",
          name: "Introduction to Programming",
          code: "CS101",
          department: "Computer Science",
          semester: 1,
          subject: "Programming",
          isActive: true,
          _count: { 
            enrollments: 35, 
            assignments: 8,
            exams: 3,
            materials: 15 
          },
          pendingEnrollments: ["req-1", "req-2"],
        },
        {
          id: "class-2",
          name: "Advanced Algorithms",
          code: "CS401",
          department: "Computer Science",
          semester: 4,
          subject: "Algorithms",
          isActive: true,
          _count: { 
            enrollments: 28, 
            assignments: 6,
            exams: 2,
            materials: 12 
          },
          pendingEnrollments: ["req-3"],
        },
        {
          id: "class-3",
          name: "Data Structures",
          code: "CS201",
          department: "Computer Science",
          semester: 2,
          subject: "Data Structures",
          isActive: true,
          _count: { 
            enrollments: 42, 
            assignments: 10,
            exams: 4,
            materials: 20 
          },
          pendingEnrollments: [],
        },
      ],
      recentSubmissions: [
        {
          id: "sub-1",
          student: { user: { name: "Alice Johnson", email: "alice@student.edu" } },
          assignment: { title: "Programming Assignment 3" },
          submittedAt: new Date().toISOString(),
          status: "PENDING",
          marks: null,
        },
        {
          id: "sub-2",
          student: { user: { name: "Bob Smith", email: "bob@student.edu" } },
          assignment: { title: "Data Structures Quiz" },
          submittedAt: new Date(Date.now() - 3600000).toISOString(),
          status: "GRADED",
          marks: 85,
        },
      ],
      upcomingExams: [
        {
          id: "exam-1",
          title: "Midterm Exam - CS101",
          startTime: new Date(Date.now() + 7 * 86400000).toISOString(),
          class: { name: "Introduction to Programming" },
        },
        {
          id: "exam-2",
          title: "Quiz 3 - CS201",
          startTime: new Date(Date.now() + 3 * 86400000).toISOString(),
          class: { name: "Data Structures" },
        },
      ],
      notifications: [
        {
          id: "notif-1",
          title: "New Enrollment Request",
          message: "3 students have requested to join CS101",
          createdAt: new Date().toISOString(),
          read: false,
        },
      ],
    }

    return NextResponse.json({ 
      success: true, 
      data: dashboardData 
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
