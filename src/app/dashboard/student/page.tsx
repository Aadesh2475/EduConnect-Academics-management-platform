"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BookOpen,
  FileText,
  Clock,
  TrendingUp,
  Bell,
  ChevronRight,
  Plus,
  GraduationCap,
  FolderOpen,
  ClipboardList,
  Calendar,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SkeletonDashboard } from "@/components/ui/skeleton"
import { getInitials, formatDate, cn } from "@/lib/utils"
import Link from "next/link"

interface DashboardData {
  student: {
    id: string | null
    name: string
    email: string
    enrollmentNo: string | null
    department: string | null
    semester: number | null
    section: string | null
    batch: string | null
    phone: string | null
  }
  stats: {
    totalClasses: number
    pendingSubmissions: number
    upcomingExams: number
    attendanceRate: number
  }
  classes: Array<{
    id: string
    name: string
    code: string
    subject: string
    department: string
    teacherName: string
    studentCount: number
    assignmentCount: number
    materialCount: number
    joinedAt: string | null
  }>
  upcomingAssignments: Array<{
    id: string
    title: string
    dueDate: string
    className: string
    subject: string
    totalMarks: number
  }>
  upcomingExams: Array<{
    id: string
    title: string
    type: string
    startTime: string
    duration: number
    className: string
    subject: string
  }>
  notifications: Array<{
    id: string
    title: string
    message: string
    type: string
    read: boolean
    createdAt: string
  }>
  announcements: Array<{
    id: string
    title: string
    content: string
    priority: string
    className: string
    teacherName: string
    createdAt: string
  }>
  performance: Array<{
    month: number
    year: number
    attendanceRate: number | null
    assignmentRate: number | null
    examAverage: number | null
    overallScore: number | null
  }>
}

// Empty state component
function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: { 
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-4">{description}</p>
      {action && (
        <Link href={action.href}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  )
}

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/student/dashboard")
        const result = await res.json()
        
        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error || "Failed to load dashboard")
        }
      } catch {
        setError("Failed to connect to server")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) return <SkeletonDashboard />

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium mb-2 dark:text-white">Unable to Load Dashboard</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{error || "Something went wrong"}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { student, stats, classes, upcomingAssignments, upcomingExams, notifications, announcements } = data

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {student.name}! 👋</h1>
            <p className="text-blue-100">
              {stats.totalClasses > 0 
                ? `You have ${stats.pendingSubmissions} pending submissions and ${stats.upcomingExams} upcoming exams.`
                : "Start by joining a class to begin your learning journey."}
            </p>
            {student.department && (
              <p className="text-blue-200 text-sm mt-1">
                {student.department} • Semester {student.semester || "-"}
              </p>
            )}
          </div>
          <Avatar className="h-16 w-16 border-2 border-white">
            <AvatarFallback className="bg-white/20 text-white text-xl">
              {getInitials(student.name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Enrolled Classes", value: stats.totalClasses, icon: BookOpen, color: "blue", href: "/dashboard/student/classes" },
          { label: "Pending Submissions", value: stats.pendingSubmissions, icon: FileText, color: "orange", href: "/dashboard/student/assignments" },
          { label: "Upcoming Exams", value: stats.upcomingExams, icon: ClipboardList, color: "purple", href: "/dashboard/student/exams" },
          { label: "Attendance Rate", value: `${stats.attendanceRate}%`, icon: TrendingUp, color: "green", href: "/dashboard/student/attendance" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1 dark:text-white">{stat.value}</p>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      stat.color === "blue" && "bg-blue-100 dark:bg-blue-900/30",
                      stat.color === "orange" && "bg-orange-100 dark:bg-orange-900/30",
                      stat.color === "purple" && "bg-purple-100 dark:bg-purple-900/30",
                      stat.color === "green" && "bg-green-100 dark:bg-green-900/30",
                    )}>
                      <stat.icon className={cn(
                        "w-6 h-6",
                        stat.color === "blue" && "text-blue-600 dark:text-blue-400",
                        stat.color === "orange" && "text-orange-600 dark:text-orange-400",
                        stat.color === "purple" && "text-purple-600 dark:text-purple-400",
                        stat.color === "green" && "text-green-600 dark:text-green-400",
                      )} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes Section */}
        <div className="lg:col-span-2">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="dark:text-white">My Classes</CardTitle>
              <Link href="/dashboard/student/classes">
                <Button variant="ghost" size="sm" className="dark:text-gray-300 dark:hover:text-white">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {classes.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title="No Classes Yet"
                  description="You haven't joined any classes. Browse available classes and request to join."
                  action={{ label: "Browse Classes", href: "/dashboard/student/classes" }}
                />
              ) : (
                <div className="space-y-4">
                  {classes.slice(0, 4).map((cls) => (
                    <Link key={cls.id} href={`/dashboard/student/classes/${cls.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                            {cls.code.substring(0, 2)}
                          </div>
                          <div>
                            <h4 className="font-medium dark:text-white">{cls.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {cls.teacherName} • {cls.code}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">
                          {cls.studentCount} students
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Assignments */}
          <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="dark:text-white">Upcoming Assignments</CardTitle>
              <Link href="/dashboard/student/assignments">
                <Button variant="ghost" size="sm" className="dark:text-gray-300 dark:hover:text-white">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingAssignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No Upcoming Assignments</p>
                  <p className="text-sm mt-1">You&apos;re all caught up! No assignments due.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAssignments.slice(0, 5).map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 rounded-lg border dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm dark:text-white">{assignment.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{assignment.className}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                          {formatDate(assignment.dueDate)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{assignment.totalMarks} marks</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Exams */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base dark:text-white">Upcoming Exams</CardTitle>
              <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">{upcomingExams.length}</Badge>
            </CardHeader>
            <CardContent>
              {upcomingExams.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming exams</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingExams.slice(0, 3).map((exam) => (
                    <div key={exam.id} className="p-3 rounded-lg border dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">{exam.type}</Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{exam.duration} min</span>
                      </div>
                      <h4 className="font-medium text-sm dark:text-white">{exam.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{exam.className}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-purple-600 dark:text-purple-400">
                        <Calendar className="w-3 h-3" />
                        {formatDate(exam.startTime)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base dark:text-white">Notifications</CardTitle>
              <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">
                {notifications.filter(n => !n.read).length}
              </Badge>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notif) => (
                    <div key={notif.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2",
                        notif.read ? "bg-gray-300 dark:bg-gray-600" : "bg-blue-500"
                      )} />
                      <div>
                        <p className="text-sm font-medium dark:text-white">{notif.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{notif.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-base dark:text-white">Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              {announcements.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No announcements yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.slice(0, 3).map((ann) => (
                    <div key={ann.id} className="border-l-2 border-blue-500 pl-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm dark:text-white">{ann.title}</h4>
                        {ann.priority === "HIGH" || ann.priority === "URGENT" ? (
                          <Badge variant="destructive" className="text-xs">
                            {ann.priority}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{ann.content}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {ann.className} • {formatDate(ann.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
