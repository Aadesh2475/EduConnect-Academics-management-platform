"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  BookOpen,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  Bell,
  ArrowRight,
  Plus,
  Users,
  Award,
  Target,
  BarChart3,
  AlertCircle,
  ChevronRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { SkeletonDashboard } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts"

// Sample data - in production, this would come from API
const performanceData = [
  { month: "Jan", score: 72 },
  { month: "Feb", score: 78 },
  { month: "Mar", score: 74 },
  { month: "Apr", score: 82 },
  { month: "May", score: 85 },
  { month: "Jun", score: 88 },
]

const attendanceData = [
  { week: "W1", rate: 100 },
  { week: "W2", rate: 80 },
  { week: "W3", rate: 100 },
  { week: "W4", rate: 60 },
  { week: "W5", rate: 100 },
  { week: "W6", rate: 80 },
]

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true)
  const [classCode, setClassCode] = useState("")
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [joining, setJoining] = useState(false)
  const [hasClasses, setHasClasses] = useState(false)
  const [stats, setStats] = useState({
    enrolledClasses: 0,
    pendingAssignments: 0,
    completedTasks: 0,
    attendanceRate: 0,
  })

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      try {
        // In production, fetch from API
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        // Set mock data for demo
        setStats({
          enrolledClasses: 5,
          pendingAssignments: 3,
          completedTasks: 12,
          attendanceRate: 92,
        })
        setHasClasses(true)
        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const handleJoinClass = async () => {
    if (!classCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a class code",
        variant: "destructive",
      })
      return
    }

    setJoining(true)
    try {
      const response = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: classCode.toUpperCase() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to join class")
      }

      toast({
        title: "Request Sent!",
        description: "Your join request has been sent to the teacher",
        variant: "success",
      })
      setJoinDialogOpen(false)
      setClassCode("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return <SkeletonDashboard />
  }

  // If no classes, show join class prompt
  if (!hasClasses) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to EduConnect!</h2>
          <p className="text-gray-600 mb-8">
            You haven&apos;t joined any classes yet. Enter a class code to get started.
          </p>
          
          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Join a Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join a Class</DialogTitle>
                <DialogDescription>
                  Enter the class code provided by your teacher to request to join.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="class-code">Class Code</Label>
                  <Input
                    id="class-code"
                    placeholder="e.g., ABC123"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    className="uppercase"
                    maxLength={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setJoinDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleJoinClass} loading={joining}>
                  Request to Join
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        
        <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Join Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join a Class</DialogTitle>
              <DialogDescription>
                Enter the class code provided by your teacher.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="class-code-2">Class Code</Label>
                <Input
                  id="class-code-2"
                  placeholder="e.g., ABC123"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  className="uppercase"
                  maxLength={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setJoinDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleJoinClass} loading={joining}>
                Request to Join
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Enrolled Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.enrolledClasses}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tasks Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Attendance Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate}%</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Performance Trend</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorScore)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Weekly Attendance</CardTitle>
              <Calendar className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="rate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Upcoming Deadlines</CardTitle>
              <Link href="/dashboard/student/assignments">
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Data Structures Lab 5",
                    class: "Computer Science 101",
                    due: "Tomorrow, 11:59 PM",
                    type: "assignment",
                    status: "pending"
                  },
                  {
                    title: "Physics Quiz - Chapter 5",
                    class: "Physics 201",
                    due: "Dec 15, 2:00 PM",
                    type: "quiz",
                    status: "pending"
                  },
                  {
                    title: "Mathematics Midterm",
                    class: "Calculus II",
                    due: "Dec 18, 10:00 AM",
                    type: "exam",
                    status: "upcoming"
                  }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.type === "assignment" ? "bg-blue-100" :
                        item.type === "quiz" ? "bg-purple-100" : "bg-orange-100"
                      }`}>
                        {item.type === "assignment" ? (
                          <FileText className={`w-5 h-5 text-blue-600`} />
                        ) : item.type === "quiz" ? (
                          <Target className={`w-5 h-5 text-purple-600`} />
                        ) : (
                          <Award className={`w-5 h-5 text-orange-600`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.class}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={item.status === "pending" ? "warning" : "secondary"}>
                        {item.status}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">{item.due}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Assistant Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Performance Analysis</h3>
              <p className="text-blue-100 text-sm mb-4">
                Get personalized insights and suggestions to improve your academic performance.
              </p>
              <Link href="/dashboard/student/ai-assistant">
                <Button variant="secondary" className="w-full bg-white text-blue-600 hover:bg-blue-50">
                  Start Analysis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Subject Performance</h3>
              <div className="space-y-4">
                {[
                  { subject: "Mathematics", score: 88, color: "bg-blue-500" },
                  { subject: "Physics", score: 75, color: "bg-purple-500" },
                  { subject: "Computer Science", score: 92, color: "bg-green-500" },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.subject}</span>
                      <span className="font-medium">{item.score}%</span>
                    </div>
                    <Progress value={item.score} indicatorClassName={item.color} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
