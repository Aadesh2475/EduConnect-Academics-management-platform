import { NextRequest, NextResponse } from "next/server"

// In-memory user storage for demo
const users = new Map<string, {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  phone?: string;
  department?: string;
  subject?: string;
  university?: string;
  createdAt: Date;
}>()

// Pre-populate with demo users
users.set("student@demo.com", {
  id: "demo-student-1",
  email: "student@demo.com",
  name: "Demo Student",
  password: "password123",
  role: "STUDENT",
  createdAt: new Date(),
})

users.set("teacher@demo.com", {
  id: "demo-teacher-1",
  email: "teacher@demo.com",
  name: "Demo Teacher",
  password: "password123",
  role: "TEACHER",
  department: "Computer Science",
  subject: "Programming",
  university: "Demo University",
  createdAt: new Date(),
})

users.set("admin@demo.com", {
  id: "demo-admin-1",
  email: "admin@demo.com",
  name: "Demo Admin",
  password: "password123",
  role: "ADMIN",
  createdAt: new Date(),
})

// Helper function to generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: "Email and password are required" 
      }, { status: 400 })
    }

    const user = users.get(email.toLowerCase())
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid email or password" 
      }, { status: 401 })
    }

    if (user.password !== password) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid email or password" 
      }, { status: 401 })
    }

    // Create session token
    const token = generateId()

    const response = NextResponse.json({
      success: true,
      data: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      },
      message: "Login successful",
    })

    // Set session cookie
    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    // Also set user info cookie for client-side access
    response.cookies.set("user_info", JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

// Export the users map for signup route to access
export { users, generateId }
