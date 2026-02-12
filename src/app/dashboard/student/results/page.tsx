"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Award, TrendingUp, BookOpen, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

export default function ResultsPage() {
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<any>(null)

  useEffect(() => {
    const fetchResults = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setResults({
        overallGPA: 3.75,
        totalCredits: 45,
        semesterResults: [
          { semester: "Sem 1", gpa: 3.6, credits: 15 },
          { semester: "Sem 2", gpa: 3.8, credits: 15 },
          { semester: "Sem 3", gpa: 3.85, credits: 15 },
        ],
        courseResults: [
          { name: "Data Structures", grade: "A", marks: 92, credits: 3 },
          { name: "Database Systems", grade: "A-", marks: 88, credits: 3 },
          { name: "Mathematics", grade: "B+", marks: 85, credits: 4 },
          { name: "Physics", grade: "A", marks: 90, credits: 3 },
        ],
        performanceData: [
          { month: "Jan", score: 78 },
          { month: "Feb", score: 82 },
          { month: "Mar", score: 85 },
          { month: "Apr", score: 88 },
          { month: "May", score: 92 },
        ]
      })
      setLoading(false)
    }
    fetchResults()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-green-100 text-green-700"
    if (grade.startsWith("B")) return "bg-blue-100 text-blue-700"
    if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-700"
    return "bg-red-100 text-red-700"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Results</h1>
        <p className="text-gray-600">View your academic performance and grades</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Overall GPA</p>
                  <p className="text-3xl font-bold">{results.overallGPA}</p>
                </div>
                <Award className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Total Credits</p>
                  <p className="text-2xl font-bold">{results.totalCredits}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Courses Completed</p>
                  <p className="text-2xl font-bold">{results.courseResults.length}</p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Avg Score</p>
                  <p className="text-2xl font-bold">{Math.round(results.courseResults.reduce((a: number, c: any) => a + c.marks, 0) / results.courseResults.length)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>Semester GPA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results.semesterResults}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis domain={[0, 4]} />
                    <Tooltip />
                    <Bar dataKey="gpa" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader>
            <CardTitle>Course Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.courseResults.map((course: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1">
                    <h3 className="font-medium">{course.name}</h3>
                    <p className="text-sm text-gray-500">{course.credits} Credits</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <Progress value={course.marks} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1 text-right">{course.marks}%</p>
                    </div>
                    <Badge className={getGradeColor(course.grade)}>{course.grade}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
