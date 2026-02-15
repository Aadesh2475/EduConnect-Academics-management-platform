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

    let user = { id: "demo", name: "Demo Student", email: "student@demo.com", role: "STUDENT" }
    if (userInfoCookie) {
      try {
        user = JSON.parse(userInfoCookie)
      } catch {}
    }

    // Return demo dashboard data
    const dashboardData = {
      student: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: null,
        department: "Computer Science",
        semester: 3,
      },
      stats: {
        enrolledClasses: 4,
        pendingAssignments: 3,
        upcomingExams: 2,
        attendanceRate: 92,
      },
      classes: [
        {
          id: "class-1",
          name: "Data Structures",
          code: "CS201",
          department: "Computer Science",
          semester: 3,
          teacher: { name: "Dr. Smith", image: null },
          _count: { enrollments: 45 },
        },
        {
          id: "class-2",
          name: "Web Development",
          code: "CS301",
          department: "Computer Science",
          semester: 3,
          teacher: { name: "Prof. Johnson", image: null },
          _count: { enrollments: 38 },
        },
        {
          id: "class-3",
          name: "Database Systems",
          code: "CS302",
          department: "Computer Science",
          semester: 3,
          teacher: { name: "Dr. Williams", image: null },
          _count: { enrollments: 42 },
        },
        {
          id: "class-4",
          name: "Operating Systems",
          code: "CS303",
          department: "Computer Science",
          semester: 3,
          teacher: { name: "Prof. Brown", image: null },
          _count: { enrollments: 40 },
        },
      ],
      notifications: [
        {
          id: "notif-1",
          title: "New Assignment",
          message: "Data Structures assignment due in 3 days",
          createdAt: new Date().toISOString(),
          read: false,
        },
        {
          id: "notif-2",
          title: "Exam Scheduled",
          message: "Web Development midterm on Friday",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          read: false,
        },
      ],
      announcements: [
        {
          id: "ann-1",
          title: "Campus Event",
          content: "Tech fest starting next week. Register now!",
          class: { name: "General" },
          teacher: { user: { name: "Admin" } },
          createdAt: new Date().toISOString(),
        },
        {
          id: "ann-2",
          title: "Holiday Notice",
          content: "University will be closed on Monday for maintenance.",
          class: { name: "General" },
          teacher: { user: { name: "Admin" } },
          createdAt: new Date(Date.now() - 172800000).toISOString(),
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
