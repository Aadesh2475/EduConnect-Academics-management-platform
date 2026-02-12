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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  GraduationCap,
  Search,
  Plus,
  MoreVertical,
  Mail,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  Download,
  UserCheck,
  UserX,
  Filter
} from "lucide-react"

interface Student {
  id: string
  name: string
  email: string
  image?: string
  enrollmentNumber: string
  department: string
  semester: string
  status: "active" | "inactive" | "suspended"
  enrolledClasses: number
  joinedAt: string
  lastActive: string
}

export default function AdminStudentsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  useEffect(() => {
    setTimeout(() => {
      setStudents([
        { id: "1", name: "Alice Johnson", email: "alice@university.edu", enrollmentNumber: "2024CS001", department: "Computer Science", semester: "5th", status: "active", enrolledClasses: 4, joinedAt: "2022-08-15", lastActive: "2024-01-15" },
        { id: "2", name: "Bob Smith", email: "bob@university.edu", enrollmentNumber: "2024CS002", department: "Computer Science", semester: "5th", status: "active", enrolledClasses: 3, joinedAt: "2022-08-15", lastActive: "2024-01-14" },
        { id: "3", name: "Carol Williams", email: "carol@university.edu", enrollmentNumber: "2024EE003", department: "Electrical Engineering", semester: "3rd", status: "active", enrolledClasses: 5, joinedAt: "2023-08-20", lastActive: "2024-01-15" },
        { id: "4", name: "David Brown", email: "david@university.edu", enrollmentNumber: "2024ME004", department: "Mechanical Engineering", semester: "7th", status: "inactive", enrolledClasses: 0, joinedAt: "2021-08-10", lastActive: "2023-12-01" },
        { id: "5", name: "Eva Martinez", email: "eva@university.edu", enrollmentNumber: "2024CS005", department: "Computer Science", semester: "5th", status: "active", enrolledClasses: 4, joinedAt: "2022-08-15", lastActive: "2024-01-15" },
        { id: "6", name: "Frank Lee", email: "frank@university.edu", enrollmentNumber: "2024PH006", department: "Physics", semester: "3rd", status: "suspended", enrolledClasses: 0, joinedAt: "2023-08-20", lastActive: "2023-11-15" },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase()

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.enrollmentNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || student.status === statusFilter
    const matchesDept = departmentFilter === "all" || student.department === departmentFilter
    return matchesSearch && matchesStatus && matchesDept
  })

  const departments = [...new Set(students.map(s => s.department))]

  const handleStatusChange = (id: string, newStatus: Student["status"]) => {
    setStudents(students.map(s => s.id === id ? { ...s, status: newStatus } : s))
    toast({
      title: "Status updated",
      description: `Student status changed to ${newStatus}.`,
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
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 mt-1">Manage all registered students</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <GraduationCap className="w-5 h-5 text-blue-600" />
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
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.filter(s => s.status === "active").length}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <UserX className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.filter(s => s.status === "inactive").length}</p>
                <p className="text-xs text-gray-500">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.filter(s => s.status === "suspended").length}</p>
                <p className="text-xs text-gray-500">Suspended</p>
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
                placeholder="Search students..."
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
                <SelectItem value="suspended">Suspended</SelectItem>
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

      {/* Students Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Enrollment</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Department</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Classes</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Status</th>
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
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{student.enrollmentNumber}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-900">{student.department}</p>
                      <p className="text-xs text-gray-500">{student.semester} Semester</p>
                    </td>
                    <td className="py-3 px-4 text-center">{student.enrolledClasses}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={
                        student.status === "active" ? "default" :
                        student.status === "inactive" ? "secondary" : "destructive"
                      }>
                        {student.status}
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
                        <Select
                          value={student.status}
                          onValueChange={(value: Student["status"]) => handleStatusChange(student.id, value)}
                        >
                          <SelectTrigger className="w-[110px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspend</SelectItem>
                          </SelectContent>
                        </Select>
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
