import { NextRequest, NextResponse } from "next/server"

// In-memory user storage for demo (shared state via module)
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
if (!users.has("student@demo.com")) {
  users.set("student@demo.com", {
    id: "demo-student-1",
    email: "student@demo.com",
    name: "Demo Student",
    password: "password123",
    role: "STUDENT",
    createdAt: new Date(),
  })
}

if (!users.has("teacher@demo.com")) {
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
}

if (!users.has("admin@demo.com")) {
  users.set("admin@demo.com", {
    id: "demo-admin-1",
    email: "admin@demo.com",
    name: "Demo Admin",
    password: "password123",
    role: "ADMIN",
    createdAt: new Date(),
  })
}

// Helper function to generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { role, email, password, name, phone, department, subject, university } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: "Email and password are required" 
      }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ 
        success: false, 
        error: "Password must be at least 8 characters" 
      }, { status: 400 })
    }

    if (!name || name.length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: "Name must be at least 2 characters" 
      }, { status: 400 })
    }

    // Check if user already exists
    if (users.has(email.toLowerCase())) {
      return NextResponse.json({ 
        success: false, 
        error: "An account with this email already exists" 
      }, { status: 400 })
    }

    // Validate teacher-specific fields
    if (role === "TEACHER") {
      if (!department || !subject || !university) {
        return NextResponse.json({ 
          success: false, 
          error: "Department, subject, and university are required for teachers" 
        }, { status: 400 })
      }
    }

    // Create new user
    const userId = generateId()
    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      name,
      password,
      role: role || "STUDENT",
      phone,
      department,
      subject,
      university,
      createdAt: new Date(),
    }

    users.set(email.toLowerCase(), newUser)

    // Create session token
    const token = generateId()

    const response = NextResponse.json({
      success: true,
      data: { 
        id: newUser.id, 
        email: newUser.email, 
        name: newUser.name, 
        role: newUser.role 
      },
      message: "Account created successfully",
    }, { status: 201 })

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
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
