"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  Download,
  UserCheck,
  UserX,
  BookOpen,
  GraduationCap,
  Mail
} from "lucide-react"

interface Teacher {
  id: string
  name: string
  email: string
  image?: string
  employeeId: string
  department: string
  subject: string
  status: "active" | "inactive" | "on_leave"
  classesCount: number
  studentsCount: number
  joinedAt: string
  lastActive: string
}

export default function AdminTeachersPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  useEffect(() => {
    setTimeout(() => {
      setTeachers([
        { id: "1", name: "Dr. Sarah Johnson", email: "sarah.j@university.edu", employeeId: "EMP-2019-001", department: "Computer Science", subject: "Data Structures", status: "active", classesCount: 4, studentsCount: 156, joinedAt: "2019-08-15", lastActive: "2024-01-15" },
        { id: "2", name: "Prof. Michael Chen", email: "michael.c@university.edu", employeeId: "EMP-2018-002", department: "Computer Science", subject: "Machine Learning", status: "active", classesCount: 3, studentsCount: 98, joinedAt: "2018-08-10", lastActive: "2024-01-15" },
        { id: "3", name: "Dr. Emily Davis", email: "emily.d@university.edu", employeeId: "EMP-2020-003", department: "Electrical Engineering", subject: "Circuit Theory", status: "active", classesCount: 2, studentsCount: 65, joinedAt: "2020-01-20", lastActive: "2024-01-14" },
        { id: "4", name: "Prof. Robert Wilson", email: "robert.w@university.edu", employeeId: "EMP-2017-004", department: "Mechanical Engineering", subject: "Thermodynamics", status: "on_leave", classesCount: 0, studentsCount: 0, joinedAt: "2017-08-15", lastActive: "2023-12-15" },
        { id: "5", name: "Dr. Lisa Anderson", email: "lisa.a@university.edu", employeeId: "EMP-2021-005", department: "Physics", subject: "Quantum Mechanics", status: "active", classesCount: 3, studentsCount: 78, joinedAt: "2021-08-20", lastActive: "2024-01-15" },
        { id: "6", name: "Prof. James Brown", email: "james.b@university.edu", employeeId: "EMP-2016-006", department: "Mathematics", subject: "Linear Algebra", status: "inactive", classesCount: 0, studentsCount: 0, joinedAt: "2016-08-10", lastActive: "2023-06-30" },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase()

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || teacher.status === statusFilter
    const matchesDept = departmentFilter === "all" || teacher.department === departmentFilter
    return matchesSearch && matchesStatus && matchesDept
  })

  const departments = [...new Set(teachers.map(t => t.department))]

  const handleStatusChange = (id: string, newStatus: Teacher["status"]) => {
    setTeachers(teachers.map(t => t.id === id ? { ...t, status: newStatus } : t))
    toast({
      title: "Status updated",
      description: `Teacher status changed to ${newStatus.replace("_", " ")}.`,
    })
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-500 mt-1">Manage faculty members</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Teacher
          </Button>
        </div>
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
                <p className="text-2xl font-bold">{teachers.length}</p>
                <p className="text-xs text-gray-500">Total Teachers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teachers.filter(t => t.status === "active").length}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teachers.reduce((acc, t) => acc + t.classesCount, 0)}</p>
                <p className="text-xs text-gray-500">Total Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <GraduationCap className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teachers.reduce((acc, t) => acc + t.studentsCount, 0)}</p>
                <p className="text-xs text-gray-500">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search teachers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Teacher</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Employee ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Department</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Classes</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Students</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={teacher.image} />
                          <AvatarFallback className="bg-purple-100 text-purple-700">{getInitials(teacher.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{teacher.name}</p>
                          <p className="text-sm text-gray-500">{teacher.subject}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{teacher.employeeId}</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{teacher.department}</td>
                    <td className="py-3 px-4 text-center">{teacher.classesCount}</td>
                    <td className="py-3 px-4 text-center">{teacher.studentsCount}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={
                        teacher.status === "active" ? "default" :
                        teacher.status === "inactive" ? "secondary" : "outline"
                      }>
                        {teacher.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Mail className="w-4 h-4" />
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
