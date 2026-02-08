import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { rateLimit, errorResponse, successResponse } from "@/lib/api/helpers"

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown"
    const rl = await rateLimit(ip, "forgot-password", 3, 300000)
    if (!rl.success) return errorResponse("Too many requests. Try again later.", 429)

    const { email } = await req.json()
    if (!email) return errorResponse("Email is required")

    const user = await prisma.user.findUnique({ where: { email } })
    // Don't reveal if user exists
    if (!user) return successResponse(null, "If an account exists with this email, you will receive a reset link.")

    // Create reset token
    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: { email, token, expires },
    })

    // In production, send email with reset link
    // For now, log the token
    console.log(`Password reset token for ${email}: ${token}`)

    return successResponse(null, "If an account exists with this email, you will receive a reset link.")
  } catch (error) {
    console.error("Forgot password error:", error)
    return errorResponse("Internal server error", 500)
  }
}
