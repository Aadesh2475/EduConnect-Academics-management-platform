"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BookOpen,
  Users,
  FileText,
  Clock,
  TrendingUp,
  Calendar,
  Bell,
  ChevronRight,
  Plus,
  Award,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { SkeletonDashboard } from "@/components/ui/skeleton"
import { getInitials, formatDate, cn } from "@/lib/utils"
import Link from "next/link"

interface DashboardData {
  student: {
    id: string
    name: string
    email: string
    image?: string
    enrollmentNo?: string
    department?: string
    semester?: number
  }
  stats: {
    enrolledClasses: number
    pendingAssignments: number
    upcomingExams: number
    attendanceRate: number
  }
  classes: Array<{
    id: string
    name: string
    code: string
    subject: string
    teacher: { name: string }
    _count: { assignments: number; materials: number }
  }>
  notifications: Array<{
    id: string
    title: string
    message: string
    type: string
    createdAt: string
    read: boolean
  }>
  announcements: Array<{
    id: string
    title: string
    content: string
    priority: string
    createdAt: string
    teacher?: { user: { name: string } }
    class?: { name: string; code: string }
  }>
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
      } catch (err) {
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
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Welcome to EduConnect!</h2>
          <p className="text-gray-600 mb-4">{error || "Complete your profile to get started."}</p>
          <Link href="/dashboard/student/profile">
            <Button>Complete Profile</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">Welcome back, {data.student.name}!</h1>
                <p className="text-blue-100">
                  {data.student.department && `${data.student.department} • `}
                  {data.student.semester && `Semester ${data.student.semester}`}
                </p>
              </div>
              <Avatar className="h-16 w-16 border-2 border-white">
                <AvatarImage src={data.student.image} />
                <AvatarFallback className="bg-white/20 text-white text-xl">
                  {getInitials(data.student.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Enrolled Classes", value: data.stats.enrolledClasses, icon: BookOpen, color: "blue", href: "/dashboard/student/classes" },
          { label: "Pending Assignments", value: data.stats.pendingAssignments, icon: FileText, color: "orange", href: "/dashboard/student/assignments" },
          { label: "Upcoming Exams", value: data.stats.upcomingExams, icon: Clock, color: "purple", href: "/dashboard/student/quiz" },
          { label: "Attendance Rate", value: `${data.stats.attendanceRate}%`, icon: CheckCircle, color: "green", href: "/dashboard/student/attendance" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      stat.color === "blue" && "bg-blue-100 text-blue-600",
                      stat.color === "orange" && "bg-orange-100 text-orange-600",
                      stat.color === "purple" && "bg-purple-100 text-purple-600",
                      stat.color === "green" && "bg-green-100 text-green-600",
                    )}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">My Classes</CardTitle>
              <Link href="/dashboard/student/classes">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {data.classes.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No classes enrolled yet</p>
                  <Link href="/dashboard/student/classes">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Join a Class
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.classes.slice(0, 4).map((cls, index) => (
                    <div
                      key={cls.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{cls.name}</p>
                          <p className="text-sm text-gray-500">
                            {cls.teacher.name} • {cls.code}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{cls._count.assignments} assignments</p>
                        <p>{cls._count.materials} materials</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications & Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.announcements.length === 0 && data.notifications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {data.announcements.slice(0, 5).map((announcement) => (
                    <div key={announcement.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <p className="font-medium text-sm">{announcement.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{announcement.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {announcement.teacher?.user.name} • {formatDate(new Date(announcement.createdAt))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
