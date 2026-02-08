"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BookOpen,
  Users,
  FileText,
  CheckCircle,
  TrendingUp,
  Calendar,
  Plus,
  ArrowRight,
  ChevronRight,
  UserPlus,
  BarChart3,
  Clock,
  Award,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SkeletonDashboard } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { getInitials } from "@/lib/utils"
import Link from "next/link"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts"

const enrollmentData = [
  { month: "Jan", students: 45 },
  { month: "Feb", students: 52 },
  { month: "Mar", students: 48 },
  { month: "Apr", students: 61 },
  { month: "May", students: 55 },
  { month: "Jun", students: 67 },
]

const classDistribution = [
  { name: "CS 101", value: 45, color: "#3b82f6" },
  { name: "Physics 201", value: 38, color: "#8b5cf6" },
  { name: "Math 301", value: 32, color: "#10b981" },
  { name: "Others", value: 25, color: "#f59e0b" },
]

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true)
  const [createClassOpen, setCreateClassOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [hasClasses, setHasClasses] = useState(false)
  const [newClass, setNewClass] = useState({
    name: "",
    department: "",
    semester: "",
    subject: "",
    description: "",
  })
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    pendingRequests: 0,
    activeAssignments: 0,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        // Mock data
        setStats({
          totalClasses: 5,
          totalStudents: 142,
          pendingRequests: 8,
          activeAssignments: 12,
        })
        setHasClasses(true)
        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const handleCreateClass = async () => {
    if (!newClass.name || !newClass.department || !newClass.semester || !newClass.subject) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setCreating(true)
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newClass,
          semester: parseInt(newClass.semester),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create class")
      }

      toast({
        title: "Class Created!",
        description: `Class code: ${data.code}. Share this with your students.`,
        variant: "success",
      })
      setCreateClassOpen(false)
      setNewClass({ name: "", department: "", semester: "", subject: "", description: "" })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <SkeletonDashboard />
  }

  // No classes state
  if (!hasClasses) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to EduConnect!</h2>
          <p className="text-gray-600 mb-8">
            Create your first class to start managing students and coursework.
          </p>
          
          <Dialog open={createClassOpen} onOpenChange={setCreateClassOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600">
                <Plus className="w-5 h-5" />
                Create Your First Class
              </Button>
            </DialogTrigger>
            <CreateClassDialog
              newClass={newClass}
              setNewClass={setNewClass}
              creating={creating}
              onSubmit={handleCreateClass}
              onCancel={() => setCreateClassOpen(false)}
            />
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
          <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600">Manage your classes and track student progress.</p>
        </div>
        
        <Dialog open={createClassOpen} onOpenChange={setCreateClassOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600">
              <Plus className="w-4 h-4" />
              Create Class
            </Button>
          </DialogTrigger>
          <CreateClassDialog
            newClass={newClass}
            setNewClass={setNewClass}
            creating={creating}
            onSubmit={handleCreateClass}
            onCancel={() => setCreateClassOpen(false)}
          />
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-600" />
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
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
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
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-orange-600" />
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
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeAssignments}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts & Pending Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrollment Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Student Enrollment Trend</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={enrollmentData}>
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
                    <Line
                      type="monotone"
                      dataKey="students"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: "#8b5cf6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Class Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Class Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={classDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                    >
                      {classDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {classDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pending Requests & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Join Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Pending Requests</CardTitle>
              <Link href="/dashboard/teacher/registrations">
                <Button variant="ghost" size="sm" className="text-purple-600">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "John Doe", class: "CS 101", time: "2 hours ago", image: "" },
                  { name: "Jane Smith", class: "Physics 201", time: "3 hours ago", image: "" },
                  { name: "Mike Johnson", class: "Math 301", time: "5 hours ago", image: "" },
                ].map((request, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={request.image} />
                        <AvatarFallback>{getInitials(request.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{request.name}</p>
                        <p className="text-sm text-gray-500">{request.class}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="h-8">
                        Reject
                      </Button>
                      <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700">
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    icon: <FileText className="w-4 h-4" />,
                    title: "Assignment Submitted",
                    desc: "15 students submitted Lab 5",
                    time: "1 hour ago",
                    iconBg: "bg-blue-100",
                    iconColor: "text-blue-600"
                  },
                  {
                    icon: <CheckCircle className="w-4 h-4" />,
                    title: "Attendance Marked",
                    desc: "CS 101 - All students marked",
                    time: "3 hours ago",
                    iconBg: "bg-green-100",
                    iconColor: "text-green-600"
                  },
                  {
                    icon: <Award className="w-4 h-4" />,
                    title: "Quiz Completed",
                    desc: "Physics Quiz - 28 attempts",
                    time: "5 hours ago",
                    iconBg: "bg-purple-100",
                    iconColor: "text-purple-600"
                  },
                  {
                    icon: <AlertCircle className="w-4 h-4" />,
                    title: "Deadline Reminder",
                    desc: "Math Assignment due tomorrow",
                    time: "6 hours ago",
                    iconBg: "bg-orange-100",
                    iconColor: "text-orange-600"
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg ${activity.iconBg} flex items-center justify-center ${activity.iconColor}`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.desc}</p>
                    </div>
                    <span className="text-xs text-gray-400">{activity.time}</span>
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

// Create Class Dialog Component
function CreateClassDialog({
  newClass,
  setNewClass,
  creating,
  onSubmit,
  onCancel,
}: {
  newClass: { name: string; department: string; semester: string; subject: string; description: string }
  setNewClass: (data: typeof newClass) => void
  creating: boolean
  onSubmit: () => void
  onCancel: () => void
}) {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Create New Class</DialogTitle>
        <DialogDescription>
          Fill in the details to create a new class. A unique code will be generated.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="class-name">Class Name *</Label>
          <Input
            id="class-name"
            placeholder="e.g., Introduction to Computer Science"
            value={newClass.name}
            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Input
              id="department"
              placeholder="e.g., Computer Science"
              value={newClass.department}
              onChange={(e) => setNewClass({ ...newClass, department: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="semester">Semester *</Label>
            <Select
              value={newClass.semester}
              onValueChange={(value) => setNewClass({ ...newClass, semester: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            placeholder="e.g., Data Structures"
            value={newClass.subject}
            onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Brief description of the class..."
            value={newClass.description}
            onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
            rows={3}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} loading={creating} className="bg-gradient-to-r from-purple-600 to-indigo-600">
          Create Class
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
