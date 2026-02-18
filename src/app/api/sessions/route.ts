import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"

async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value

  if (!sessionToken) return null

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        include: {
          teacher: true,
          student: true
        }
      }
    }
  })

  if (!session || session.expires < new Date()) return null
  return session.user
}

// GET - List all sessions (for admin) or sessions by class
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const userId = searchParams.get("userId")
    const skip = (page - 1) * limit

    let where: any = {}

    if (user.role === "ADMIN") {
      // Admin can see all sessions
      if (userId) where.userId = userId
    } else {
      // Users can only see their own sessions
      where.userId = user.id
    }

    // Filter out expired sessions
    where.expires = { gte: new Date() }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true, image: true } }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    })

    const total = await prisma.session.count({ where })

    return NextResponse.json({
      success: true,
      data: sessions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Terminate session(s)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")
    const all = searchParams.get("all") === "true"
    const userId = searchParams.get("userId")

    if (all) {
      // Admin can terminate all sessions for a user
      if (user.role !== "ADMIN" && userId && userId !== user.id) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 })
      }

      // Get current session token to preserve it
      const cookieStore = await cookies()
      const currentToken = cookieStore.get("session_token")?.value

      await prisma.session.deleteMany({
        where: {
          userId: userId || user.id,
          sessionToken: { not: currentToken }
        }
      })

      return NextResponse.json({
        success: true,
        message: "All other sessions terminated"
      })
    }

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const session = await prisma.session.findUnique({ where: { id: sessionId } })
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Check authorization
    if (user.role !== "ADMIN" && session.userId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    await prisma.session.delete({ where: { id: sessionId } })

    return NextResponse.json({
      success: true,
      message: "Session terminated"
    })
  } catch (error) {
    console.error("Error terminating session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
