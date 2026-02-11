import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { errorResponse } from "@/lib/api/helpers"

type RouteParams = { params: Promise<{ roomId: string }> }

// GET /api/student/messages/[roomId] - Get messages for a specific room
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) return errorResponse("Unauthorized", 401)
    if (session.role !== "STUDENT") return errorResponse("Forbidden", 403)

    const { roomId } = await params
    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get("cursor")
    const limit = parseInt(searchParams.get("limit") || "50")

    // Verify user is a member of the room
    const membership = await prisma.chatRoomMember.findFirst({
      where: { roomId, userId: session.userId }
    })

    if (!membership) {
      return errorResponse("You are not a member of this room", 403)
    }

    // Get room details
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, image: true, role: true } }
          }
        },
        class: { select: { name: true, code: true } }
      }
    })

    if (!room) {
      return errorResponse("Room not found", 404)
    }

    // Get messages with cursor-based pagination
    const messages = await prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? {
        cursor: { id: cursor },
        skip: 1
      } : {}),
      include: {
        sender: { select: { id: true, name: true, image: true } }
      }
    })

    const hasMore = messages.length > limit
    if (hasMore) {
      messages.pop()
    }

    // Format messages
    const formattedMessages = messages.map(m => ({
      id: m.id,
      content: m.content,
      type: m.type,
      senderId: m.senderId,
      senderName: m.sender.name,
      senderImage: m.sender.image,
      isMe: m.senderId === session.userId,
      createdAt: m.createdAt
    })).reverse()

    // Format room info
    const otherMembers = room.members.filter(m => m.userId !== session.userId)
    const roomInfo = {
      id: room.id,
      name: room.name || otherMembers.map(m => m.user.name).join(", ") || "Group Chat",
      type: room.type,
      classInfo: room.class,
      members: room.members.map(m => ({
        id: m.user.id,
        name: m.user.name,
        image: m.user.image,
        role: m.user.role,
        isMe: m.userId === session.userId
      }))
    }

    return NextResponse.json({
      success: true,
      data: {
        room: roomInfo,
        messages: formattedMessages,
        hasMore,
        nextCursor: hasMore && messages.length > 0 ? messages[messages.length - 1].id : null
      }
    })
  } catch (error) {
    console.error("Get room messages error:", error)
    return errorResponse("Internal server error", 500)
  }
}

// POST /api/student/messages/[roomId] - Send a message to a specific room
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) return errorResponse("Unauthorized", 401)
    if (session.role !== "STUDENT") return errorResponse("Forbidden", 403)

    const { roomId } = await params
    const body = await req.json()
    const { content, type = "TEXT" } = body

    if (!content) {
      return errorResponse("Content is required", 400)
    }

    // Verify user is a member of the room
    const membership = await prisma.chatRoomMember.findFirst({
      where: { roomId, userId: session.userId }
    })

    if (!membership) {
      return errorResponse("You are not a member of this room", 403)
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        roomId,
        senderId: session.userId,
        content,
        type
      },
      include: {
        sender: { select: { id: true, name: true, image: true } }
      }
    })

    // Update room timestamp
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        type: message.type,
        senderId: message.senderId,
        senderName: message.sender.name,
        senderImage: message.sender.image,
        isMe: true,
        createdAt: message.createdAt
      }
    })
  } catch (error) {
    console.error("Send message error:", error)
    return errorResponse("Internal server error", 500)
  }
}
