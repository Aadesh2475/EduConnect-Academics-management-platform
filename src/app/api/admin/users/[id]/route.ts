import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { errorResponse } from "@/lib/api/helpers"

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session || session.role !== "ADMIN") {
      return errorResponse("Forbidden", 403)
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            classEnrollments: {
              include: {
                class: {
                  select: { name: true, code: true }
                }
              }
            }
          }
        },
        teacher: {
          include: {
            classes: {
              select: {
                id: true,
                name: true,
                code: true,
                _count: { select: { enrollments: true } }
              }
            }
          }
        },
      }
    })

    if (!user) {
      return errorResponse("User not found", 404)
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error("Get user error:", error)
    return errorResponse("Internal server error", 500)
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session || session.role !== "ADMIN") {
      return errorResponse("Forbidden", 403)
    }

    const { id } = await params
    const body = await req.json()
    const { name, email, role } = body

    const user = await prisma.user.update({
      where: { id },
      data: { name, email, role },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error("Update user error:", error)
    return errorResponse("Internal server error", 500)
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session || session.role !== "ADMIN") {
      return errorResponse("Forbidden", 403)
    }

    const { id } = await params

    // Prevent self-deletion
    if (id === session.userId) {
      return errorResponse("Cannot delete your own account", 400)
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "User deleted" })
  } catch (error) {
    console.error("Delete user error:", error)
    return errorResponse("Internal server error", 500)
  }
}
