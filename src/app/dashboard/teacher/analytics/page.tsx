"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Target,
  PieChart
} from "lucide-react"

interface AnalyticsData {
  overview: {
    totalStudents: number
    averageAttendance: number
    averageGrade: number
    assignmentCompletion: number
    trend: "up" | "down"
    trendValue: number
  }
  classPerformance: {
    className: string
    students: number
    avgGrade: number
    attendance: number
    completion: number
  }[]
  gradeDistribution: {
    grade: string
    count: number
    percentage: number
  }[]
  attendanceTrend: {
    week: string
    rate: number
  }[]
  topPerformers: {
    name: string
    class: string
    grade: number
    attendance: number
  }[]
  atRiskStudents: {
    name: string
    class: string
    issue: string
    grade: number
  }[]
}

export default function TeacherAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("semester")

  useEffect(() => {
    setTimeout(() => {
      setData({
        overview: {
          totalStudents: 156,
          averageAttendance: 87.5,
          averageGrade: 78.3,
          assignmentCompletion: 82.1,
          trend: "up",
          trendValue: 5.2
        },
        classPerformance: [
          { className: "Data Structures (CS201)", students: 45, avgGrade: 82.5, attendance: 91.2, completion: 88.5 },
          { className: "Algorithms (CS301)", students: 38, avgGrade: 76.8, attendance: 85.6, completion: 79.2 },
          { className: "Web Development (CS250)", students: 52, avgGrade: 79.4, attendance: 88.3, completion: 84.1 },
          { className: "Database Systems (CS302)", students: 21, avgGrade: 74.2, attendance: 82.1, completion: 76.5 },
        ],
        gradeDistribution: [
          { grade: "A (90-100)", count: 28, percentage: 18 },
          { grade: "B (80-89)", count: 45, percentage: 29 },
          { grade: "C (70-79)", count: 52, percentage: 33 },
          { grade: "D (60-69)", count: 21, percentage: 14 },
          { grade: "F (<60)", count: 10, percentage: 6 },
        ],
        attendanceTrend: [
          { week: "Week 1", rate: 92 },
          { week: "Week 2", rate: 89 },
          { week: "Week 3", rate: 85 },
          { week: "Week 4", rate: 88 },
          { week: "Week 5", rate: 91 },
          { week: "Week 6", rate: 87 },
        ],
        topPerformers: [
          { name: "Alice Johnson", class: "CS201", grade: 98, attendance: 100 },
          { name: "Bob Smith", class: "CS301", grade: 96, attendance: 98 },
          { name: "Carol Williams", class: "CS250", grade: 95, attendance: 100 },
          { name: "David Brown", class: "CS201", grade: 94, attendance: 96 },
          { name: "Eva Martinez", class: "CS302", grade: 93, attendance: 100 },
        ],
        atRiskStudents: [
          { name: "John Doe", class: "CS301", issue: "Low attendance", grade: 58 },
          { name: "Jane Wilson", class: "CS250", issue: "Missing assignments", grade: 62 },
          { name: "Mike Taylor", class: "CS302", issue: "Declining grades", grade: 55 },
        ]
      })
      setLoading(false)
    }, 800)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600"
    if (grade >= 80) return "text-blue-600"
    if (grade >= 70) return "text-yellow-600"
    if (grade >= 60) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Monitor student performance and engagement</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="semester">This Semester</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Students</p>
                <p className="text-3xl font-bold">{data.overview.totalStudents}</p>
              </div>
              <Users className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Avg Attendance</p>
                <p className="text-3xl font-bold">{data.overview.averageAttendance}%</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Avg Grade</p>
                <p className="text-3xl font-bold">{data.overview.averageGrade}%</p>
              </div>
              <Award className="w-10 h-10 text-purple-200" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              {data.overview.trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-300" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-300" />
              )}
              <span className="text-sm text-purple-100">
                {data.overview.trend === "up" ? "+" : "-"}{data.overview.trendValue}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Assignment Completion</p>
                <p className="text-3xl font-bold">{data.overview.assignmentCompletion}%</p>
              </div>
              <Target className="w-10 h-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Class Performance</TabsTrigger>
          <TabsTrigger value="grades">Grade Distribution</TabsTrigger>
          <TabsTrigger value="students">Student Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Performance by Class
              </CardTitle>
              <CardDescription>Compare metrics across your classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Class</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Students</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Avg Grade</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Attendance</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.classPerformance.map((cls, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-purple-600" />
                            <span className="font-medium text-gray-900">{cls.className}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">{cls.students}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-medium ${getGradeColor(cls.avgGrade)}`}>
                            {cls.avgGrade}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={cls.attendance >= 85 ? "default" : "secondary"}>
                            {cls.attendance}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">{cls.completion}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Attendance Trend
              </CardTitle>
              <CardDescription>Weekly attendance rate across all classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 h-48">
                {data.attendanceTrend.map((week, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all duration-300 hover:from-purple-600 hover:to-purple-500"
                      style={{ height: `${week.rate}%` }}
                    />
                    <span className="text-xs text-gray-500 mt-2">{week.week}</span>
                    <span className="text-xs font-medium">{week.rate}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                Grade Distribution
              </CardTitle>
              <CardDescription>Overview of student grades across all classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.gradeDistribution.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{item.grade}</span>
                      <span className="text-gray-500">{item.count} students ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          index === 0 ? "bg-green-500" :
                          index === 1 ? "bg-blue-500" :
                          index === 2 ? "bg-yellow-500" :
                          index === 3 ? "bg-orange-500" : "bg-red-500"
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Top Performers
                </CardTitle>
                <CardDescription>Students with highest grades and attendance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.topPerformers.map((student, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-green-50">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.class}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{student.grade}%</p>
                      <p className="text-xs text-gray-500">{student.attendance}% attendance</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* At-Risk Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Students Needing Attention
                </CardTitle>
                <CardDescription>Students who may need additional support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.atRiskStudents.map((student, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-red-50">
                    <div className="p-2 rounded-full bg-red-100">
                      <XCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.class}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">{student.issue}</Badge>
                      <p className="text-sm text-red-600 mt-1">{student.grade}%</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
