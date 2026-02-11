"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  MoreHorizontal,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
  Image,
  Users,
  Check,
  CheckCheck,
  Circle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { SkeletonTable } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { getInitials, cn } from "@/lib/utils"

interface ChatRoom {
  id: string
  name: string
  type: "DIRECT" | "GROUP" | "CLASS"
  lastMessage?: {
    content: string
    createdAt: string
    senderId: string
  }
  unreadCount: number
  members: {
    id: string
    name: string
    image?: string
    online?: boolean
  }[]
}

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderImage?: string
  createdAt: string
  read: boolean
}

export default function MessagesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserId = "current-user"

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setChatRooms([
        {
          id: "1",
          name: "Dr. Jane Smith",
          type: "DIRECT",
          lastMessage: { content: "Please submit your assignment by tomorrow", createdAt: new Date().toISOString(), senderId: "user1" },
          unreadCount: 2,
          members: [{ id: "user1", name: "Dr. Jane Smith", online: true }]
        },
        {
          id: "2",
          name: "CS201 - Data Structures",
          type: "CLASS",
          lastMessage: { content: "Quiz results are now available", createdAt: new Date(Date.now() - 3600000).toISOString(), senderId: "user2" },
          unreadCount: 5,
          members: [
            { id: "user2", name: "Prof. Robert Chen", online: true },
            { id: "user3", name: "Mike Johnson", online: false },
            { id: "user4", name: "Sarah Wilson", online: true },
          ]
        },
        {
          id: "3",
          name: "Study Group",
          type: "GROUP",
          lastMessage: { content: "Anyone free for study session tonight?", createdAt: new Date(Date.now() - 7200000).toISOString(), senderId: "user3" },
          unreadCount: 0,
          members: [
            { id: "user3", name: "Mike Johnson", online: false },
            { id: "user4", name: "Sarah Wilson", online: true },
            { id: "user5", name: "Emily Chen", online: false },
          ]
        },
        {
          id: "4",
          name: "Prof. Robert Chen",
          type: "DIRECT",
          lastMessage: { content: "Thank you for the clarification", createdAt: new Date(Date.now() - 86400000).toISOString(), senderId: currentUserId },
          unreadCount: 0,
          members: [{ id: "user2", name: "Prof. Robert Chen", online: true }]
        },
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (selectedRoom) {
      setMessages([
        { id: "m1", content: "Hi! I have a question about the assignment", senderId: currentUserId, senderName: "You", createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), read: true },
        { id: "m2", content: "Sure, what would you like to know?", senderId: "user1", senderName: selectedRoom.members[0]?.name || "Unknown", senderImage: selectedRoom.members[0]?.image, createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(), read: true },
        { id: "m3", content: "What is the deadline for submission?", senderId: currentUserId, senderName: "You", createdAt: new Date(Date.now() - 3600000).toISOString(), read: true },
        { id: "m4", content: "Please submit your assignment by tomorrow", senderId: "user1", senderName: selectedRoom.members[0]?.name || "Unknown", senderImage: selectedRoom.members[0]?.image, createdAt: new Date().toISOString(), read: false },
      ])
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedRoom])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return
    const newMsg: Message = {
      id: `m${Date.now()}`,
      content: newMessage,
      senderId: currentUserId,
      senderName: "You",
      createdAt: new Date().toISOString(),
      read: false,
    }
    setMessages(prev => [...prev, newMsg])
    setNewMessage("")
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    if (diff < 604800000) return date.toLocaleDateString([], { weekday: "short" })
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <div className="p-6"><SkeletonTable /></div>

  return (
    <div className="h-[calc(100vh-12rem)]">
      <Card className="h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Chat List */}
          <div className="border-r border-gray-200">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Messages</h2>
                <Button size="sm" onClick={() => setShowNewChatDialog(true)}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </div>
            <ScrollArea className="h-[calc(100%-120px)]">
              <div className="p-2">
                {filteredRooms.map(room => (
                  <div
                    key={room.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      selectedRoom?.id === room.id ? "bg-blue-50" : "hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedRoom(room)}
                  >
                    <div className="relative">
                      {room.type === "DIRECT" ? (
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={room.members[0]?.image} />
                          <AvatarFallback>{getInitials(room.name)}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                      )}
                      {room.type === "DIRECT" && room.members[0]?.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{room.name}</p>
                        {room.lastMessage && (
                          <span className="text-xs text-gray-500">{formatTime(room.lastMessage.createdAt)}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 truncate">
                          {room.lastMessage?.senderId === currentUserId && "You: "}
                          {room.lastMessage?.content || "No messages yet"}
                        </p>
                        {room.unreadCount > 0 && (
                          <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">{room.unreadCount}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="col-span-2 flex flex-col h-full">
            {selectedRoom ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedRoom.type === "DIRECT" ? (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedRoom.members[0]?.image} />
                        <AvatarFallback>{getInitials(selectedRoom.name)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{selectedRoom.name}</p>
                      <p className="text-xs text-gray-500">
                        {selectedRoom.type === "DIRECT" 
                          ? (selectedRoom.members[0]?.online ? "Online" : "Offline")
                          : `${selectedRoom.members.length} members`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon"><Phone className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon"><Video className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon"><Info className="w-5 h-5" /></Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    <AnimatePresence>
                      {messages.map((message, index) => {
                        const isOwn = message.senderId === currentUserId
                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                          >
                            <div className={cn("flex items-end gap-2", isOwn && "flex-row-reverse")}>
                              {!isOwn && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={message.senderImage} />
                                  <AvatarFallback>{getInitials(message.senderName)}</AvatarFallback>
                                </Avatar>
                              )}
                              <div className={cn(
                                "max-w-md px-4 py-2 rounded-2xl",
                                isOwn ? "bg-blue-600 text-white rounded-br-md" : "bg-gray-100 text-gray-900 rounded-bl-md"
                              )}>
                                <p className="text-sm">{message.content}</p>
                                <div className={cn("flex items-center justify-end gap-1 mt-1", isOwn ? "text-blue-200" : "text-gray-400")}>
                                  <span className="text-xs">{formatTime(message.createdAt)}</span>
                                  {isOwn && (message.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon"><Paperclip className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon"><Image className="w-5 h-5" /></Button>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon"><Smile className="w-5 h-5" /></Button>
                    <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600">Select a conversation</h3>
                  <p className="text-gray-400">Choose a chat from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* New Chat Dialog */}
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
            <DialogDescription>Start a new chat with a student or teacher</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Search users..." />
            <div className="space-y-2">
              {["Dr. Jane Smith", "Prof. Robert Chen", "Mike Johnson", "Sarah Wilson"].map(name => (
                <div key={name} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Avatar><AvatarFallback>{getInitials(name)}</AvatarFallback></Avatar>
                  <div><p className="font-medium">{name}</p><p className="text-sm text-gray-500">Teacher</p></div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowNewChatDialog(false)}>Cancel</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
