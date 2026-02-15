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

    let user = { id: "demo", name: "Demo Admin", email: "admin@demo.com", role: "ADMIN" }
    if (userInfoCookie) {
      try {
        user = JSON.parse(userInfoCookie)
      } catch {}
    }

    // Return demo dashboard data
    const dashboardData = {
      admin: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      stats: {
        totalStudents: 1250,
        totalTeachers: 85,
        totalClasses: 120,
        activeUsers: 892,
        pendingApprovals: 15,
        systemHealth: 98,
      },
      userGrowth: [
        { month: "Jan", students: 980, teachers: 72 },
        { month: "Feb", students: 1020, teachers: 75 },
        { month: "Mar", students: 1080, teachers: 78 },
        { month: "Apr", students: 1150, teachers: 80 },
        { month: "May", students: 1200, teachers: 83 },
        { month: "Jun", students: 1250, teachers: 85 },
      ],
      recentActivity: [
        { id: "act-1", type: "user_registered", user: "John Doe", role: "STUDENT", timestamp: new Date().toISOString() },
        { id: "act-2", type: "class_created", user: "Prof. Smith", className: "Advanced ML", timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: "act-3", type: "user_registered", user: "Jane Wilson", role: "TEACHER", timestamp: new Date(Date.now() - 7200000).toISOString() },
        { id: "act-4", type: "exam_created", user: "Dr. Brown", examTitle: "Final Exam - DS", timestamp: new Date(Date.now() - 10800000).toISOString() },
        { id: "act-5", type: "user_suspended", user: "Bob Smith", reason: "Policy violation", timestamp: new Date(Date.now() - 14400000).toISOString() },
      ],
      recentUsers: [
        { id: "user-1", name: "Alice Johnson", email: "alice@example.com", role: "STUDENT", status: "active", createdAt: new Date().toISOString() },
        { id: "user-2", name: "Prof. Michael", email: "michael@example.com", role: "TEACHER", status: "active", createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: "user-3", name: "Sarah Williams", email: "sarah@example.com", role: "STUDENT", status: "active", createdAt: new Date(Date.now() - 172800000).toISOString() },
        { id: "user-4", name: "Dr. Robert", email: "robert@example.com", role: "TEACHER", status: "pending", createdAt: new Date(Date.now() - 259200000).toISOString() },
        { id: "user-5", name: "Tom Brown", email: "tom@example.com", role: "STUDENT", status: "suspended", createdAt: new Date(Date.now() - 345600000).toISOString() },
      ],
      roleDistribution: [
        { role: "Students", count: 1250, percentage: 89 },
        { role: "Teachers", count: 85, percentage: 6 },
        { role: "Admins", count: 12, percentage: 1 },
        { role: "Others", count: 53, percentage: 4 },
      ],
      systemStatus: {
        database: { status: "healthy", latency: "12ms" },
        api: { status: "healthy", uptime: "99.9%" },
        auth: { status: "healthy", sessions: 892 },
        cache: { status: "healthy", hitRate: "94%" },
      },
      notifications: [
        {
          id: "notif-1",
          title: "System Alert",
          message: "Database backup completed successfully",
          createdAt: new Date().toISOString(),
          read: false,
        },
        {
          id: "notif-2",
          title: "New User Reports",
          message: "5 new user reports need review",
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
