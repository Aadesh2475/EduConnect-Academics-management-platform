import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const userInfoCookie = req.cookies.get("user_info")?.value
    const sessionToken = req.cookies.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 })
    }

    let user = { id: "demo", name: "Demo Teacher", email: "teacher@demo.com", role: "TEACHER" }
    if (userInfoCookie) {
      try {
        user = JSON.parse(userInfoCookie)
      } catch {}
    }

    // Return demo dashboard data
    const dashboardData = {
      teacher: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: null,
        department: "Computer Science",
        subject: "Programming",
        university: "Demo University",
      },
      stats: {
        totalStudents: 125,
        totalClasses: 4,
        pendingJoinRequests: 5,
        assignmentsToGrade: 12,
      },
      classes: [
        {
          id: "class-1",
          name: "Data Structures",
          code: "CS201",
          department: "Computer Science",
          semester: 3,
          isActive: true,
          _count: { 
            enrollments: 45,
            assignments: 8,
            exams: 3,
            materials: 15,
          },
          pendingEnrollments: ["req-1", "req-2"],
        },
        {
          id: "class-2",
          name: "Algorithms",
          code: "CS301",
          department: "Computer Science",
          semester: 4,
          isActive: true,
          _count: { 
            enrollments: 38,
            assignments: 6,
            exams: 2,
            materials: 12,
          },
          pendingEnrollments: ["req-3"],
        },
        {
          id: "class-3",
          name: "Advanced Programming",
          code: "CS401",
          department: "Computer Science",
          semester: 5,
          isActive: true,
          _count: { 
            enrollments: 32,
            assignments: 10,
            exams: 4,
            materials: 18,
          },
          pendingEnrollments: [],
        },
        {
          id: "class-4",
          name: "Software Engineering",
          code: "CS402",
          department: "Computer Science",
          semester: 6,
          isActive: false,
          _count: { 
            enrollments: 10,
            assignments: 5,
            exams: 2,
            materials: 8,
          },
          pendingEnrollments: ["req-4", "req-5"],
        },
      ],
      recentSubmissions: [
        {
          id: "sub-1",
          student: { name: "John Doe", email: "john@example.com" },
          assignment: { title: "Binary Trees Implementation" },
          submittedAt: new Date().toISOString(),
          status: "SUBMITTED",
          marks: null,
        },
        {
          id: "sub-2",
          student: { name: "Jane Smith", email: "jane@example.com" },
          assignment: { title: "Graph Algorithms" },
          submittedAt: new Date(Date.now() - 3600000).toISOString(),
          status: "SUBMITTED",
          marks: null,
        },
        {
          id: "sub-3",
          student: { name: "Bob Wilson", email: "bob@example.com" },
          assignment: { title: "Dynamic Programming" },
          submittedAt: new Date(Date.now() - 7200000).toISOString(),
          status: "GRADED",
          marks: 85,
        },
      ],
      upcomingExams: [
        {
          id: "exam-1",
          title: "Midterm - Data Structures",
          class: { name: "Data Structures" },
          startTime: new Date(Date.now() + 172800000).toISOString(),
          duration: 120,
        },
        {
          id: "exam-2",
          title: "Quiz - Algorithms",
          class: { name: "Algorithms" },
          startTime: new Date(Date.now() + 432000000).toISOString(),
          duration: 60,
        },
      ],
      notifications: [
        {
          id: "notif-1",
          title: "New Submission",
          message: "John Doe submitted assignment",
          createdAt: new Date().toISOString(),
          read: false,
        },
        {
          id: "notif-2",
          title: "Join Request",
          message: "3 new students want to join CS201",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          read: false,
        },
      ],
    }

    return NextResponse.json({ success: true, data: dashboardData })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
