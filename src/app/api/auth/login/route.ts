import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyPassword, createSession } from "@/lib/auth/session"
import { rateLimit, errorResponse } from "@/lib/api/helpers"

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown"
    const rl = await rateLimit(ip, "login", 10, 60000)
    if (!rl.success) return errorResponse("Too many login attempts. Please try again later.", 429)

    const body = await req.json()
    const { email, password, role } = body

    if (!email || !password) return errorResponse("Email and password are required")

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return errorResponse("Invalid email or password", 401)

    if (!user.password) return errorResponse("This account uses social login. Please use Google or GitHub.", 401)

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) return errorResponse("Invalid email or password", 401)

    // Optional: Check role match
    if (role && user.role !== role) {
      return errorResponse(`This account is registered as ${user.role.toLowerCase()}. Please select the correct role.`, 401)
    }

    const token = await createSession(user.id)

    const response = NextResponse.json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name, role: user.role },
      message: "Login successful",
    })

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return errorResponse("Internal server error", 500)
  }
}
