import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { errorResponse } from "@/lib/api/helpers"

// GET /api/student/messages - Get student's chat rooms and recent messages
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return errorResponse("Unauthorized", 401)
    if (session.role !== "STUDENT") return errorResponse("Forbidden", 403)

    // Get user's chat rooms
    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        members: {
          some: { userId: session.userId }
        }
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, image: true, role: true } }
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: { select: { name: true } }
          }
        },
        class: { select: { name: true, code: true } }
      },
      orderBy: { updatedAt: "desc" }
    })

    // Format chat rooms
    const formattedRooms = chatRooms.map(room => {
      const lastMessage = room.messages[0]
      const otherMembers = room.members.filter(m => m.userId !== session.userId)
      
      return {
        id: room.id,
        name: room.name || otherMembers.map(m => m.user.name).join(", ") || "Group Chat",
        type: room.type,
        classInfo: room.class,
        members: otherMembers.map(m => ({
          id: m.user.id,
          name: m.user.name,
          image: m.user.image,
          role: m.user.role
        })),
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          senderName: lastMessage.sender.name,
          createdAt: lastMessage.createdAt
        } : null,
        unreadCount: 0, // TODO: Implement unread count
        updatedAt: room.updatedAt
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedRooms
    })
  } catch (error) {
    console.error("Get messages error:", error)
    return errorResponse("Internal server error", 500)
  }
}

// POST /api/student/messages - Create a new chat room or send a message
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return errorResponse("Unauthorized", 401)
    if (session.role !== "STUDENT") return errorResponse("Forbidden", 403)

    const body = await req.json()
    const { action, roomId, content, recipientId, classId } = body

    if (action === "create_room") {
      // Create a new direct message room
      if (!recipientId) {
        return errorResponse("Recipient is required", 400)
      }

      // Check if room already exists
      const existingRoom = await prisma.chatRoom.findFirst({
        where: {
          type: "DIRECT",
          AND: [
            { members: { some: { userId: session.userId } } },
            { members: { some: { userId: recipientId } } }
          ]
        }
      })

      if (existingRoom) {
        return NextResponse.json({
          success: true,
          data: { roomId: existingRoom.id },
          message: "Room already exists"
        })
      }

      // Create new room
      const newRoom = await prisma.chatRoom.create({
        data: {
          type: "DIRECT",
          members: {
            create: [
              { userId: session.userId },
              { userId: recipientId }
            ]
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: { roomId: newRoom.id },
        message: "Room created successfully"
      })
    }

    if (action === "send_message") {
      if (!roomId || !content) {
        return errorResponse("Room ID and content are required", 400)
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
          type: "TEXT"
        },
        include: {
          sender: { select: { name: true, image: true } }
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
          senderName: message.sender.name,
          senderImage: message.sender.image,
          createdAt: message.createdAt
        }
      })
    }

    return errorResponse("Invalid action", 400)
  } catch (error) {
    console.error("Messages action error:", error)
    return errorResponse("Internal server error", 500)
  }
}
