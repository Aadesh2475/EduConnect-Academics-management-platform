import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { errorResponse } from "@/lib/api/helpers"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return errorResponse("Unauthorized", 401)
    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get("unread") === "true"
    const where: Record<string, unknown> = { userId: session.id }
    if (unreadOnly) where.read = false
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({ where: where as never, orderBy: { createdAt: "desc" }, take: 20 }),
      prisma.notification.count({ where: where as never }),
    ])
    return NextResponse.json({ success: true, data: notifications, total })
  } catch (error) {
    console.error("GET notifications error:", error)
    return errorResponse("Internal server error", 500)
  }
}
