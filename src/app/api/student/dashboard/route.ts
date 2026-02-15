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
    
    if (user.role !== "STUDENT") {
      return NextResponse.json({ 
        success: false, 
        error: "Forbidden" 
      }, { status: 403 })
    }

    // Return mock dashboard data
    const dashboardData = {
      student: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: "123-456-7890",
        department: "Computer Science",
        semester: 3,
        enrollmentNumber: "STU-2024-001",
        avatar: null,
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
          name: "Introduction to Programming",
          code: "CS101",
          department: "Computer Science",
          semester: 1,
          subject: "Programming",
          teacher: { user: { name: "Dr. John Smith" } },
          _count: { enrollments: 35 },
        },
        {
          id: "class-2",
          name: "Data Structures",
          code: "CS201",
          department: "Computer Science",
          semester: 2,
          subject: "Data Structures",
          teacher: { user: { name: "Prof. Jane Doe" } },
          _count: { enrollments: 28 },
        },
        {
          id: "class-3",
          name: "Web Development",
          code: "CS301",
          department: "Computer Science",
          semester: 3,
          subject: "Web Dev",
          teacher: { user: { name: "Dr. Mike Wilson" } },
          _count: { enrollments: 42 },
        },
      ],
      notifications: [
        {
          id: "notif-1",
          title: "New Assignment Posted",
          message: "CS101: Complete the programming exercise by Friday",
          createdAt: new Date().toISOString(),
          read: false,
        },
        {
          id: "notif-2",
          title: "Exam Schedule Updated",
          message: "Midterm exams have been rescheduled to next week",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          read: true,
        },
      ],
      announcements: [
        {
          id: "ann-1",
          title: "Campus Event",
          content: "Join us for the annual tech fest next month!",
          createdAt: new Date().toISOString(),
          class: { name: "General" },
          teacher: { user: { name: "Admin" } },
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
