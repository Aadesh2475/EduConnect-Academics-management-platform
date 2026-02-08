import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { errorResponse, successResponse, rateLimit } from "@/lib/api/helpers"

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown"
    const rl = await rateLimit(ip, "feedback", 5, 300000)
    if (!rl.success) return errorResponse("Too many requests", 429)
    const session = await getSession()
    const body = await req.json()
    const feedback = await prisma.feedback.create({
      data: { userId: session?.id || null, email: body.email || session?.email || null, subject: body.subject, message: body.message, rating: body.rating || null, type: body.type || "GENERAL" },
    })
    return successResponse(feedback, "Feedback submitted")
  } catch (error) {
    console.error("Feedback error:", error)
    return errorResponse("Internal server error", 500)
  }
}
