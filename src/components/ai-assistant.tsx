"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot,
  Send,
  User,
  Sparkles,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  ChevronDown,
  BookOpen,
  TrendingUp,
  Target,
  Lightbulb,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const suggestedQuestions = [
  { text: "How can I improve my grades?", icon: TrendingUp },
  { text: "What subjects should I focus on?", icon: Target },
  { text: "Create a study plan for me", icon: BookOpen },
  { text: "Give me study tips", icon: Lightbulb },
]

export default function AIAssistantPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load initial greeting
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm your AI learning assistant. I can help you with:\n\n• Analyzing your academic performance\n• Creating personalized study plans\n• Providing study tips and strategies\n• Answering questions about your courses\n• Suggesting areas for improvement\n\nHow can I help you today?",
        timestamp: new Date(),
      }
    ])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setShowSuggestions(false)

    try {
      // Simulate AI response (in production, this would call the AI API)
      await new Promise(resolve => setTimeout(resolve, 1500))

      const responses: Record<string, string> = {
        "How can I improve my grades?": "Based on your current performance, here are some personalized recommendations:\n\n1. **Focus on Data Structures** - Your quiz scores show room for improvement. Try practicing more algorithmic problems.\n\n2. **Attend all classes** - Your attendance rate is 85%. Consistent attendance correlates with better grades.\n\n3. **Submit assignments on time** - You've had 2 late submissions this month. Use calendar reminders!\n\n4. **Form study groups** - Collaborative learning can boost understanding by up to 30%.\n\n5. **Visit office hours** - Your teachers are here to help. Don't hesitate to ask questions!",
        "What subjects should I focus on?": "Looking at your academic data, I recommend focusing on:\n\n**Priority 1: Data Structures & Algorithms**\n- Current score: 72%\n- Target: 85%\n- This is a foundational subject that impacts other courses\n\n**Priority 2: Mathematics**\n- Current score: 78%\n- Target: 85%\n- Strong math skills will help in algorithm analysis\n\n**Keep maintaining:**\n- Database Systems (90%) - Excellent work!\n- English (88%) - Good progress",
        "Create a study plan for me": "Here's your personalized weekly study plan:\n\n**Monday - Data Structures (2 hours)**\n- Review linked lists and trees\n- Practice 3 coding problems\n\n**Tuesday - Mathematics (1.5 hours)**\n- Focus on calculus concepts\n- Complete practice problems\n\n**Wednesday - Database Systems (1 hour)**\n- Review SQL queries\n- Work on the project\n\n**Thursday - Data Structures (2 hours)**\n- Study graphs and algorithms\n- Solve LeetCode problems\n\n**Friday - Mixed Review (1.5 hours)**\n- Review the week's concepts\n- Prepare questions for teachers\n\n**Weekend - Catch up & Projects**\n- Complete pending assignments\n- Work on long-term projects",
        "Give me study tips": "Here are evidence-based study tips:\n\n📚 **Active Recall**\nTest yourself instead of just re-reading. Use flashcards or practice problems.\n\n⏰ **Pomodoro Technique**\nStudy for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer break.\n\n📝 **Spaced Repetition**\nReview material at increasing intervals. Don't cram!\n\n🎯 **Set Specific Goals**\nInstead of \"study math,\" try \"solve 5 calculus problems.\"\n\n😴 **Sleep Well**\n7-8 hours of sleep improves memory consolidation.\n\n🏃 **Exercise Regularly**\nPhysical activity boosts brain function and reduces stress.\n\n📱 **Minimize Distractions**\nUse apps to block social media during study time.",
      }

      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: responses[messageText] || "I understand your question about \"" + messageText + "\". Let me analyze your academic data to provide a personalized response.\n\nBased on your current performance:\n- Overall GPA: 3.4\n- Attendance: 85%\n- Assignments completed: 92%\n\nI recommend focusing on consistent study habits and active participation in classes. Would you like me to create a specific plan for any subject?",
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({ title: "Copied!", description: "Message copied to clipboard" })
  }

  const clearChat = () => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "Chat cleared. How can I help you today?",
      timestamp: new Date(),
    }])
    setShowSuggestions(true)
  }

  return (
    <div className="h-[calc(100vh-12rem)]">
      <Card className="h-full flex flex-col">
        {/* Header */}
        <CardHeader className="border-b py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  AI Learning Assistant
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="w-3 h-3" />
                    Beta
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-500">Powered by AI • Personalized guidance</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearChat}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Chat
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-2xl rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-gray-100 text-gray-900 rounded-bl-md"
                  )}>
                    <div className="prose prose-sm max-w-none">
                      {message.content.split("\n").map((line, i) => (
                        <p key={i} className={cn(
                          "mb-2 last:mb-0",
                          message.role === "user" && "text-white"
                        )}>
                          {line.startsWith("**") ? (
                            <strong>{line.replace(/\*\*/g, "")}</strong>
                          ) : line.startsWith("•") || line.startsWith("-") ? (
                            <span className="flex items-start gap-2">
                              <span>•</span>
                              <span>{line.substring(1).trim()}</span>
                            </span>
                          ) : line.startsWith("📚") || line.startsWith("⏰") || line.startsWith("📝") || line.startsWith("🎯") || line.startsWith("😴") || line.startsWith("🏃") || line.startsWith("📱") ? (
                            <span className="font-medium">{line}</span>
                          ) : (
                            line
                          )}
                        </p>
                      ))}
                    </div>
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200">
                        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleCopy(message.content)}>
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />
                    <span className="text-gray-500">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Suggestions */}
            {showSuggestions && messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <p className="text-sm text-gray-500 mb-3">Suggested questions:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto py-3 px-4"
                      onClick={() => handleSend(question.text)}
                    >
                      <question.icon className="w-4 h-4 mr-2 text-blue-600" />
                      {question.text}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Ask me anything about your studies..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={() => handleSend()} disabled={!input.trim() || isLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              AI responses are generated based on your academic data. Always verify important information.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
