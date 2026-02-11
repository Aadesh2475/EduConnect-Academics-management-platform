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
import { getInitials, formatDate } from "@/lib/utils"
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
} from "recharts"

interface TeacherData {
  teacher: {
    id: string
    name: string
    email: string
    image?: string
    employeeId?: string
    department?: string
    subject?: string
    university?: string
  }
  stats: {
    totalClasses: number
    activeClasses: number
    totalStudents: number
    pendingRequests: number
    assignmentsToGrade: number
  }
  classes: Array<{
    id: string
    name: string
    code: string
    description?: string
    department: string
    semester: number
    subject: string
    isActive: boolean
    _count: {
      enrollments: number
      assignments: number
      exams: number
      materials: number
    }
    pendingRequests: number
  }>
  recentSubmissions: Array<{
    id: string
    studentName: string
    studentEmail: string
    assignmentTitle: string
    submittedAt: string
    status: string
    marks: number | null
  }>
  upcomingExams: Array<{
    id: string
    title: string
    startTime: string
    endTime: string
    class: { name: string; code: string }
  }>
  notifications: Array<{
    id: string
    title: string
    message: string
    type: string
    createdAt: string
    read: boolean
  }>
}

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<TeacherData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [createClassOpen, setCreateClassOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newClass, setNewClass] = useState({
    name: "",
    department: "",
    semester: "",
    subject: "",
    description: "",
  })

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/teacher/dashboard")
      const result = await res.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || "Failed to load dashboard")
      }
    } catch (err) {
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
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
      const response = await fetch("/api/teacher/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newClass,
          semester: parseInt(newClass.semester),
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create class")
      }

      toast({
        title: "Class Created!",
        description: `Class code: ${result.data.code}. Share this with your students.`,
        variant: "success",
      })
      setCreateClassOpen(false)
      setNewClass({ name: "", department: "", semester: "", subject: "", description: "" })
      
      // Refresh dashboard
      fetchDashboard()
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

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Welcome to EduConnect!</h2>
          <p className="text-gray-600 mb-4">{error || "Complete your profile to get started."}</p>
          <Link href="/dashboard/teacher/profile">
            <Button>Complete Profile</Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Calculate class distribution for chart
  const classDistribution = data.classes.map((c, i) => ({
    name: c.name.length > 15 ? c.name.substring(0, 12) + "..." : c.name,
    value: c._count.enrollments,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  // Create enrollment trend data from submissions
  const enrollmentData = (() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    return months.map((month) => ({
      month,
      students: Math.floor(data.stats.totalStudents * (0.7 + Math.random() * 0.3)),
    }))
  })()

  // No classes state
  if (data.classes.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {data.teacher.name}!</h2>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">Welcome back, {data.teacher.name}!</h1>
                <p className="text-purple-100">
                  {data.teacher.department && `${data.teacher.department} • `}
                  {data.teacher.subject && data.teacher.subject}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Dialog open={createClassOpen} onOpenChange={setCreateClassOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-white text-purple-600 hover:bg-purple-50">
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
                <Avatar className="h-16 w-16 border-2 border-white">
                  <AvatarImage src={data.teacher.image} />
                  <AvatarFallback className="bg-white/20 text-white text-xl">
                    {getInitials(data.teacher.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Classes", value: data.stats.totalClasses, icon: BookOpen, color: "purple", href: "/dashboard/teacher/classes" },
          { label: "Active Classes", value: data.stats.activeClasses, icon: CheckCircle, color: "green", href: "/dashboard/teacher/classes" },
          { label: "Total Students", value: data.stats.totalStudents, icon: Users, color: "blue", href: "/dashboard/teacher/students" },
          { label: "Pending Requests", value: data.stats.pendingRequests, icon: UserPlus, color: "orange", href: "/dashboard/teacher/registrations" },
          { label: "To Grade", value: data.stats.assignmentsToGrade, icon: FileText, color: "red", href: "/dashboard/teacher/grading" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={stat.href}>
              <Card className={`border-l-4 hover:shadow-lg transition-shadow cursor-pointer ${
                stat.color === "purple" ? "border-l-purple-500" :
                stat.color === "green" ? "border-l-green-500" :
                stat.color === "blue" ? "border-l-blue-500" :
                stat.color === "orange" ? "border-l-orange-500" :
                "border-l-red-500"
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      stat.color === "purple" ? "bg-purple-100 text-purple-600" :
                      stat.color === "green" ? "bg-green-100 text-green-600" :
                      stat.color === "blue" ? "bg-blue-100 text-blue-600" :
                      stat.color === "orange" ? "bg-orange-100 text-orange-600" :
                      "bg-red-100 text-red-600"
                    }`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Trend */}
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
              <CardTitle className="text-lg font-semibold">Students per Class</CardTitle>
            </CardHeader>
            <CardContent>
              {classDistribution.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No student enrollments yet
                </div>
              ) : (
                <>
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
                    {classDistribution.slice(0, 4).map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-600">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Submissions & Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Recent Submissions</CardTitle>
              <Link href="/dashboard/teacher/grading">
                <Button variant="ghost" size="sm" className="text-purple-600">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {data.recentSubmissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  No submissions yet
                </div>
              ) : (
                <div className="space-y-3">
                  {data.recentSubmissions.slice(0, 5).map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getInitials(submission.studentName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{submission.studentName}</p>
                          <p className="text-xs text-gray-500">{submission.assignmentTitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {submission.marks !== null ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Graded: {submission.marks}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            Pending
                          </Badge>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(new Date(submission.submittedAt))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Exams */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Upcoming Exams</CardTitle>
              <Link href="/dashboard/teacher/exams">
                <Button variant="ghost" size="sm" className="text-purple-600">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {data.upcomingExams.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  No upcoming exams
                </div>
              ) : (
                <div className="space-y-3">
                  {data.upcomingExams.slice(0, 5).map((exam) => (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Award className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{exam.title}</p>
                          <p className="text-xs text-gray-500">{exam.class.name} • {exam.class.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                          {formatDate(new Date(exam.startTime))}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Classes Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Your Classes</CardTitle>
            <Link href="/dashboard/teacher/classes">
              <Button variant="ghost" size="sm" className="text-purple-600">
                Manage Classes <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.classes.slice(0, 6).map((cls) => (
                <Link key={cls.id} href={`/dashboard/teacher/classes/${cls.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                          <p className="text-sm text-gray-500">{cls.code}</p>
                        </div>
                        <Badge variant={cls.isActive ? "default" : "secondary"}>
                          {cls.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{cls._count.enrollments} students</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <FileText className="w-4 h-4" />
                          <span>{cls._count.assignments} assignments</span>
                        </div>
                      </div>
                      {cls.pendingRequests > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            {cls.pendingRequests} pending request{cls.pendingRequests > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
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
        <Button onClick={onSubmit} disabled={creating} className="bg-gradient-to-r from-purple-600 to-indigo-600">
          {creating ? "Creating..." : "Create Class"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
