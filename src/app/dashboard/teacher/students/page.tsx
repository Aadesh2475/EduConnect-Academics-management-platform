"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  Search,
  Mail,
  BookOpen,
  BarChart3,
  Calendar,
  MessageSquare,
  Eye,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle
} from "lucide-react"

interface Student {
  id: string
  name: string
  email: string
  image?: string
  enrollmentNumber: string
  department: string
  semester: string
  classes: string[]
  avgGrade: number
  attendance: number
  assignmentsCompleted: number
  totalAssignments: number
  trend: "up" | "down" | "stable"
  joinedDate: string
}

export default function TeacherStudentsPage() {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  useEffect(() => {
    setTimeout(() => {
      setStudents([
        { id: "1", name: "Alice Johnson", email: "alice.j@university.edu", enrollmentNumber: "2024CS001", department: "Computer Science", semester: "5th", classes: ["CS201", "CS301"], avgGrade: 92, attendance: 98, assignmentsCompleted: 18, totalAssignments: 20, trend: "up", joinedDate: "2024-08-15" },
        { id: "2", name: "Bob Smith", email: "bob.s@university.edu", enrollmentNumber: "2024CS002", department: "Computer Science", semester: "5th", classes: ["CS201"], avgGrade: 78, attendance: 85, assignmentsCompleted: 15, totalAssignments: 20, trend: "stable", joinedDate: "2024-08-15" },
        { id: "3", name: "Carol Williams", email: "carol.w@university.edu", enrollmentNumber: "2024CS003", department: "Computer Science", semester: "5th", classes: ["CS301", "CS250"], avgGrade: 88, attendance: 92, assignmentsCompleted: 17, totalAssignments: 20, trend: "up", joinedDate: "2024-08-16" },
        { id: "4", name: "David Brown", email: "david.b@university.edu", enrollmentNumber: "2024CS004", department: "Computer Science", semester: "5th", classes: ["CS250"], avgGrade: 65, attendance: 72, assignmentsCompleted: 12, totalAssignments: 20, trend: "down", joinedDate: "2024-08-17" },
        { id: "5", name: "Eva Martinez", email: "eva.m@university.edu", enrollmentNumber: "2024CS005", department: "Computer Science", semester: "5th", classes: ["CS201", "CS250"], avgGrade: 95, attendance: 100, assignmentsCompleted: 20, totalAssignments: 20, trend: "up", joinedDate: "2024-08-15" },
        { id: "6", name: "Frank Lee", email: "frank.l@university.edu", enrollmentNumber: "2024CS006", department: "Computer Science", semester: "5th", classes: ["CS301"], avgGrade: 72, attendance: 80, assignmentsCompleted: 14, totalAssignments: 20, trend: "stable", joinedDate: "2024-08-18" },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase()
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600"
    if (grade >= 80) return "text-blue-600"
    if (grade >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.enrollmentNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClass = classFilter === "all" || student.classes.includes(classFilter)
    return matchesSearch && matchesClass
  })

  const classOptions = [...new Set(students.flatMap(s => s.classes))]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
        <p className="text-gray-500 mt-1">View and manage students across your classes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-xs text-gray-500">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.filter(s => s.avgGrade >= 80).length}</p>
                <p className="text-xs text-gray-500">High Performers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(students.reduce((acc, s) => acc + s.attendance, 0) / students.length).toFixed(0)}%</p>
                <p className="text-xs text-gray-500">Avg Attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.filter(s => s.trend === "down").length}</p>
                <p className="text-xs text-gray-500">Need Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classOptions.map(cls => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Student Directory
          </CardTitle>
          <CardDescription>
            {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Classes</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Grade</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Attendance</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Progress</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Trend</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.image} />
                          <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.enrollmentNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {student.classes.map(cls => (
                          <Badge key={cls} variant="outline" className="text-xs">{cls}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold ${getGradeColor(student.avgGrade)}`}>
                        {student.avgGrade}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={student.attendance >= 85 ? "default" : "secondary"}>
                        {student.attendance}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Progress value={(student.assignmentsCompleted / student.totalAssignments) * 100} className="h-2 w-20" />
                        <span className="text-xs text-gray-500">
                          {student.assignmentsCompleted}/{student.totalAssignments}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {student.trend === "up" && <TrendingUp className="w-5 h-5 text-green-500 mx-auto" />}
                      {student.trend === "down" && <TrendingDown className="w-5 h-5 text-red-500 mx-auto" />}
                      {student.trend === "stable" && <span className="text-gray-400">—</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedStudent(student)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Student Details</DialogTitle>
                              <DialogDescription>
                                Detailed information about {selectedStudent?.name || student.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                  <AvatarFallback className="text-2xl">{getInitials(student.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-xl font-semibold">{student.name}</h3>
                                  <p className="text-gray-500">{student.email}</p>
                                  <Badge variant="outline" className="mt-2">{student.enrollmentNumber}</Badge>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-gray-50">
                                  <p className="text-sm text-gray-500">Average Grade</p>
                                  <p className={`text-2xl font-bold ${getGradeColor(student.avgGrade)}`}>{student.avgGrade}%</p>
                                </div>
                                <div className="p-4 rounded-lg bg-gray-50">
                                  <p className="text-sm text-gray-500">Attendance</p>
                                  <p className="text-2xl font-bold">{student.attendance}%</p>
                                </div>
                                <div className="p-4 rounded-lg bg-gray-50">
                                  <p className="text-sm text-gray-500">Assignments</p>
                                  <p className="text-2xl font-bold">{student.assignmentsCompleted}/{student.totalAssignments}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-gray-50">
                                  <p className="text-sm text-gray-500">Enrolled Classes</p>
                                  <div className="flex gap-1 mt-1">
                                    {student.classes.map(cls => (
                                      <Badge key={cls}>{cls}</Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
