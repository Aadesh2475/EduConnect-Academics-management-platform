"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  MessageSquare,
  Search,
  Send,
  Plus,
  Circle,
  Users,
  Paperclip,
  MoreVertical
} from "lucide-react"

interface ChatRoom {
  id: string
  name: string
  type: "direct" | "class"
  image?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  participants?: number
}

interface Message {
  id: string
  senderId: string
  senderName: string
  senderImage?: string
  content: string
  timestamp: string
  isOwn: boolean
}

export default function TeacherMessagesPage() {
  const [loading, setLoading] = useState(true)
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setTimeout(() => {
      setChatRooms([
        { id: "1", name: "Data Structures (CS201)", type: "class", lastMessage: "Assignment deadline extended", lastMessageTime: "10:30 AM", unreadCount: 3, participants: 45 },
        { id: "2", name: "Alice Johnson", type: "direct", lastMessage: "Thank you for the feedback!", lastMessageTime: "9:15 AM", unreadCount: 0 },
        { id: "3", name: "Algorithms (CS301)", type: "class", lastMessage: "Quiz results are out", lastMessageTime: "Yesterday", unreadCount: 12, participants: 38 },
        { id: "4", name: "Bob Smith", type: "direct", lastMessage: "Can I schedule a meeting?", lastMessageTime: "Yesterday", unreadCount: 1 },
        { id: "5", name: "Web Development (CS250)", type: "class", lastMessage: "Project teams announced", lastMessageTime: "2 days ago", unreadCount: 0, participants: 52 },
        { id: "6", name: "Carol Williams", type: "direct", lastMessage: "I need help with the project", lastMessageTime: "3 days ago", unreadCount: 0 },
      ])
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    if (selectedRoom) {
      // Simulate loading messages for selected room
      setMessages([
        { id: "1", senderId: "s1", senderName: "Alice Johnson", content: "Professor, I have a question about the assignment.", timestamp: "10:15 AM", isOwn: false },
        { id: "2", senderId: "t1", senderName: "You", content: "Sure, what would you like to know?", timestamp: "10:18 AM", isOwn: true },
        { id: "3", senderId: "s1", senderName: "Alice Johnson", content: "Can we use external libraries for the project?", timestamp: "10:20 AM", isOwn: false },
        { id: "4", senderId: "t1", senderName: "You", content: "Yes, but please document which libraries you use and why.", timestamp: "10:25 AM", isOwn: true },
        { id: "5", senderId: "s1", senderName: "Alice Johnson", content: "Thank you for the feedback!", timestamp: "10:30 AM", isOwn: false },
      ])
    }
  }, [selectedRoom])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return
    
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: "t1",
      senderName: "You",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    }
    setMessages([...messages, newMsg])
    setNewMessage("")
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase()
  }

  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-6 h-[600px]">
          <div className="bg-gray-200 rounded-xl animate-pulse" />
          <div className="col-span-2 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 mt-1">Communicate with students and classes</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
        {/* Chat List */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-1 p-2">
                {filteredRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                      selectedRoom?.id === room.id
                        ? "bg-purple-50 border border-purple-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={room.image} />
                        <AvatarFallback className={room.type === "class" ? "bg-purple-100 text-purple-700" : ""}>
                          {room.type === "class" ? <Users className="w-5 h-5" /> : getInitials(room.name)}
                        </AvatarFallback>
                      </Avatar>
                      {room.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">{room.name}</p>
                        <span className="text-xs text-gray-500">{room.lastMessageTime}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{room.lastMessage}</p>
                      {room.type === "class" && room.participants && (
                        <p className="text-xs text-gray-400">{room.participants} participants</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={selectedRoom.type === "class" ? "bg-purple-100 text-purple-700" : ""}>
                        {selectedRoom.type === "class" ? <Users className="w-5 h-5" /> : getInitials(selectedRoom.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{selectedRoom.name}</CardTitle>
                      <CardDescription>
                        {selectedRoom.type === "class" 
                          ? `${selectedRoom.participants} participants`
                          : "Direct message"}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex gap-2 max-w-[70%] ${message.isOwn ? "flex-row-reverse" : ""}`}>
                          {!message.isOwn && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(message.senderName)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            {!message.isOwn && (
                              <p className="text-xs text-gray-500 mb-1">{message.senderName}</p>
                            )}
                            <div
                              className={`p-3 rounded-2xl ${
                                message.isOwn
                                  ? "bg-purple-600 text-white rounded-tr-none"
                                  : "bg-gray-100 text-gray-900 rounded-tl-none"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <p className={`text-xs text-gray-400 mt-1 ${message.isOwn ? "text-right" : ""}`}>
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No conversation selected</h3>
                <p className="text-gray-500 mt-1">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
