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
    
    if (user.role !== "ADMIN") {
      return NextResponse.json({ 
        success: false, 
        error: "Forbidden" 
      }, { status: 403 })
    }

    // Return mock dashboard data
    const dashboardData = {
      admin: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: null,
      },
      stats: {
        totalStudents: 1250,
        totalTeachers: 85,
        totalClasses: 120,
        activeUsers: 892,
      },
      recentUsers: [
        {
          id: "user-1",
          name: "Alice Johnson",
          email: "alice@student.edu",
          role: "STUDENT",
          status: "active",
          createdAt: new Date().toISOString(),
        },
        {
          id: "user-2",
          name: "Dr. John Smith",
          email: "john@teacher.edu",
          role: "TEACHER",
          status: "active",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "user-3",
          name: "Bob Williams",
          email: "bob@student.edu",
          role: "STUDENT",
          status: "active",
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
        {
          id: "user-4",
          name: "Prof. Sarah Davis",
          email: "sarah@teacher.edu",
          role: "TEACHER",
          status: "active",
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        },
      ],
      systemHealth: {
        database: { status: "healthy", latency: 12 },
        apiServer: { status: "healthy", latency: 45 },
        authService: { status: "healthy", latency: 23 },
        cache: { status: "healthy", latency: 5 },
      },
      userGrowth: [
        { month: "Jan", students: 980, teachers: 65 },
        { month: "Feb", students: 1050, teachers: 70 },
        { month: "Mar", students: 1120, teachers: 75 },
        { month: "Apr", students: 1180, teachers: 80 },
        { month: "May", students: 1250, teachers: 85 },
      ],
      activityStats: [
        { date: "Mon", logins: 450, pageViews: 2340 },
        { date: "Tue", logins: 520, pageViews: 2780 },
        { date: "Wed", logins: 480, pageViews: 2560 },
        { date: "Thu", logins: 510, pageViews: 2890 },
        { date: "Fri", logins: 420, pageViews: 2120 },
      ],
      notifications: [
        {
          id: "notif-1",
          title: "System Update Completed",
          message: "The latest security patches have been applied",
          createdAt: new Date().toISOString(),
          read: false,
        },
        {
          id: "notif-2",
          title: "New Teacher Registration",
          message: "5 new teachers have registered this week",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          read: true,
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
