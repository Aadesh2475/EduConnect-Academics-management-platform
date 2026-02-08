import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hashPassword, createSession } from "@/lib/auth/session"
import { rateLimit, errorResponse } from "@/lib/api/helpers"

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown"
    const rl = await rateLimit(ip, "signup", 5, 60000)
    if (!rl.success) return errorResponse("Too many requests. Please try again later.", 429)

    const body = await req.json()
    const { role, email, password, name, phone, department, subject, university } = body

    if (!email || !password) return errorResponse("Email and password are required")
    if (password.length < 6) return errorResponse("Password must be at least 6 characters")

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return errorResponse("An account with this email already exists")

    const hashedPassword = await hashPassword(password)

    // Create user based on role
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        password: hashedPassword,
        role: role || "STUDENT",
        provider: "CREDENTIALS",
      },
    })

    // Create role-specific profile
    if (role === "STUDENT" || !role) {
      await prisma.student.create({
        data: {
          userId: user.id,
          phone: phone || null,
        },
      })
    } else if (role === "TEACHER") {
      if (!department || !subject || !university) {
        return errorResponse("Department, subject, and university are required for teachers")
      }
      await prisma.teacher.create({
        data: {
          userId: user.id,
          department,
          subject,
          university,
          phone: phone || null,
        },
      })
    }

    // Create session
    const token = await createSession(user.id)

    const response = NextResponse.json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name, role: user.role },
      message: "Account created successfully",
    }, { status: 201 })

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Signup error:", error)
    return errorResponse("Internal server error", 500)
  }
}
