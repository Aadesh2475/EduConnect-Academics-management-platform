"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  GraduationCap,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  FileText,
  Star,
  Trophy,
  Target,
  Clock
} from "lucide-react"

interface AcademicData {
  cgpa: number
  totalCredits: number
  completedCredits: number
  currentSemester: number
  semesters: {
    number: number
    gpa: number
    credits: number
    courses: {
      name: string
      code: string
      credits: number
      grade: string
      gradePoint: number
    }[]
  }[]
  achievements: {
    id: string
    title: string
    description: string
    date: string
    type: string
  }[]
}

export default function StudentAcademicsPage() {
  const [loading, setLoading] = useState(true)
  const [academicData, setAcademicData] = useState<AcademicData | null>(null)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAcademicData({
        cgpa: 3.75,
        totalCredits: 120,
        completedCredits: 78,
        currentSemester: 5,
        semesters: [
          {
            number: 4,
            gpa: 3.8,
            credits: 18,
            courses: [
              { name: "Data Structures", code: "CS201", credits: 3, grade: "A", gradePoint: 4.0 },
              { name: "Database Systems", code: "CS301", credits: 3, grade: "A-", gradePoint: 3.7 },
              { name: "Web Development", code: "CS250", credits: 3, grade: "A", gradePoint: 4.0 },
              { name: "Calculus III", code: "MTH301", credits: 3, grade: "B+", gradePoint: 3.3 },
              { name: "Technical Writing", code: "ENG201", credits: 3, grade: "A-", gradePoint: 3.7 },
              { name: "Operating Systems", code: "CS302", credits: 3, grade: "A", gradePoint: 4.0 },
            ]
          },
          {
            number: 3,
            gpa: 3.65,
            credits: 18,
            courses: [
              { name: "Object-Oriented Programming", code: "CS150", credits: 3, grade: "A", gradePoint: 4.0 },
              { name: "Discrete Mathematics", code: "MTH202", credits: 3, grade: "B+", gradePoint: 3.3 },
              { name: "Computer Networks", code: "CS220", credits: 3, grade: "A-", gradePoint: 3.7 },
              { name: "Statistics", code: "MTH250", credits: 3, grade: "B+", gradePoint: 3.3 },
              { name: "Communication Skills", code: "ENG150", credits: 3, grade: "A", gradePoint: 4.0 },
              { name: "Digital Logic", code: "CS180", credits: 3, grade: "A-", gradePoint: 3.7 },
            ]
          },
        ],
        achievements: [
          { id: "1", title: "Dean's List", description: "Fall 2024 Semester", date: "2024-12-15", type: "academic" },
          { id: "2", title: "Hackathon Winner", description: "1st Place in University Hackathon", date: "2024-11-10", type: "competition" },
          { id: "3", title: "Perfect Attendance", description: "100% attendance in Spring 2024", date: "2024-05-20", type: "attendance" },
        ]
      })
      setLoading(false)
    }, 1000)
  }, [])

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-green-100 text-green-800"
    if (grade.startsWith("B")) return "bg-blue-100 text-blue-800"
    if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

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

  if (!academicData) return null

  const progressPercent = (academicData.completedCredits / academicData.totalCredits) * 100

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Academic Details</h1>
        <p className="text-gray-500 mt-1">Track your academic progress and achievements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">CGPA</p>
                <p className="text-3xl font-bold">{academicData.cgpa.toFixed(2)}</p>
              </div>
              <Trophy className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Credits Completed</p>
                <p className="text-3xl font-bold">{academicData.completedCredits}/{academicData.totalCredits}</p>
              </div>
              <Target className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Current Semester</p>
                <p className="text-3xl font-bold">{academicData.currentSemester}</p>
              </div>
              <Clock className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Achievements</p>
                <p className="text-3xl font-bold">{academicData.achievements.length}</p>
              </div>
              <Award className="w-10 h-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Degree Progress
          </CardTitle>
          <CardDescription>Track your journey towards graduation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Credits Completed</span>
              <span className="font-medium">{progressPercent.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-xs text-gray-500 mt-2">
              {academicData.totalCredits - academicData.completedCredits} credits remaining to complete your degree
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grades" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grades">Semester Grades</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="grades" className="space-y-6">
          {academicData.semesters.map((semester) => (
            <Card key={semester.number}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      Semester {semester.number}
                    </CardTitle>
                    <CardDescription>{semester.credits} Credits</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    GPA: {semester.gpa.toFixed(2)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Course Code</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Course Name</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Credits</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Grade</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semester.courses.map((course) => (
                        <tr key={course.code} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{course.code}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{course.name}</td>
                          <td className="py-3 px-4 text-sm text-center text-gray-600">{course.credits}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={getGradeColor(course.grade)}>{course.grade}</Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-center font-medium text-gray-900">
                            {course.gradePoint.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          {academicData.achievements.map((achievement) => (
            <Card key={achievement.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(achievement.date).toLocaleDateString()}
                      </span>
                      <Badge variant="outline" className="text-xs">{achievement.type}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
