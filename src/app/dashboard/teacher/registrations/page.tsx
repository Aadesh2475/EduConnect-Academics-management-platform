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
  UserPlus,
  Search,
  Check,
  X,
  Clock,
  Users,
  BookOpen,
  Filter,
  Mail,
  Calendar
} from "lucide-react"

interface Registration {
  id: string
  studentName: string
  studentEmail: string
  studentImage?: string
  className: string
  classCode: string
  department: string
  semester: string
  requestDate: string
  status: "pending" | "approved" | "rejected"
  enrollmentNumber?: string
}

export default function TeacherRegistrationsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [classFilter, setClassFilter] = useState("all")

  useEffect(() => {
    setTimeout(() => {
      setRegistrations([
        { id: "1", studentName: "Alice Johnson", studentEmail: "alice.j@university.edu", className: "Data Structures", classCode: "CS201", department: "Computer Science", semester: "Fall 2024", requestDate: "2024-01-15", status: "pending", enrollmentNumber: "2024CS001" },
        { id: "2", studentName: "Bob Smith", studentEmail: "bob.s@university.edu", className: "Algorithms", classCode: "CS301", department: "Computer Science", semester: "Fall 2024", requestDate: "2024-01-14", status: "pending", enrollmentNumber: "2024CS002" },
        { id: "3", studentName: "Carol Williams", studentEmail: "carol.w@university.edu", className: "Data Structures", classCode: "CS201", department: "Computer Science", semester: "Fall 2024", requestDate: "2024-01-13", status: "approved", enrollmentNumber: "2024CS003" },
        { id: "4", studentName: "David Brown", studentEmail: "david.b@university.edu", className: "Web Development", classCode: "CS250", department: "Computer Science", semester: "Fall 2024", requestDate: "2024-01-12", status: "rejected" },
        { id: "5", studentName: "Eva Martinez", studentEmail: "eva.m@university.edu", className: "Algorithms", classCode: "CS301", department: "Computer Science", semester: "Fall 2024", requestDate: "2024-01-11", status: "pending", enrollmentNumber: "2024CS005" },
        { id: "6", studentName: "Frank Lee", studentEmail: "frank.l@university.edu", className: "Data Structures", classCode: "CS201", department: "Computer Science", semester: "Fall 2024", requestDate: "2024-01-10", status: "approved", enrollmentNumber: "2024CS006" },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const handleApprove = (id: string) => {
    setRegistrations(registrations.map(r => 
      r.id === id ? { ...r, status: "approved" as const } : r
    ))
    toast({
      title: "Registration approved",
      description: "Student has been added to the class.",
    })
  }

  const handleReject = (id: string) => {
    setRegistrations(registrations.map(r => 
      r.id === id ? { ...r, status: "rejected" as const } : r
    ))
    toast({
      title: "Registration rejected",
      description: "Student registration has been declined.",
      variant: "destructive",
    })
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase()
  }

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reg.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reg.className.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || reg.status === statusFilter
    const matchesClass = classFilter === "all" || reg.classCode === classFilter
    return matchesSearch && matchesStatus && matchesClass
  })

  const pendingCount = registrations.filter(r => r.status === "pending").length
  const approvedCount = registrations.filter(r => r.status === "approved").length
  const rejectedCount = registrations.filter(r => r.status === "rejected").length

  const uniqueClasses = [...new Set(registrations.map(r => ({ code: r.classCode, name: r.className })))]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Registrations</h1>
        <p className="text-gray-500 mt-1">Manage student enrollment requests for your classes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
                <p className="text-sm text-yellow-600">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
                <p className="text-sm text-green-600">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-100">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{rejectedCount}</p>
                <p className="text-sm text-red-600">Rejected</p>
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
                placeholder="Search by name, email, or class..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map((cls, idx) => (
                  <SelectItem key={idx} value={cls.code}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Registrations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-purple-600" />
            Registration Requests
          </CardTitle>
          <CardDescription>
            {filteredRegistrations.length} registration{filteredRegistrations.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No registrations found</h3>
              <p className="text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border hover:bg-gray-50"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={registration.studentImage} />
                    <AvatarFallback>{getInitials(registration.studentName)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{registration.studentName}</h3>
                      <Badge
                        variant={
                          registration.status === "approved" ? "default" :
                          registration.status === "rejected" ? "destructive" : "secondary"
                        }
                      >
                        {registration.status}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {registration.studentEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {registration.className} ({registration.classCode})
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(registration.requestDate).toLocaleDateString()}
                      </span>
                    </div>
                    {registration.enrollmentNumber && (
                      <p className="text-xs text-gray-400 mt-1">
                        Enrollment: {registration.enrollmentNumber}
                      </p>
                    )}
                  </div>

                  {registration.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(registration.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(registration.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
