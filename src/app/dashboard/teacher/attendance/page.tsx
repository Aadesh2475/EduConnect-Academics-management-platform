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
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  CheckSquare,
  Search,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Plus,
  Save
} from "lucide-react"

interface Student {
  id: string
  name: string
  email: string
  enrollmentNumber: string
  status: "present" | "absent" | "late" | "excused" | null
}

interface AttendanceSession {
  id: string
  date: string
  className: string
  classCode: string
  topic: string
  totalPresent: number
  totalAbsent: number
  totalStudents: number
}

export default function TeacherAttendancePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [selectedClass, setSelectedClass] = useState("all")
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false)
  const [currentSession, setCurrentSession] = useState<{
    className: string
    classCode: string
    topic: string
    students: Student[]
  } | null>(null)

  useEffect(() => {
    setTimeout(() => {
      setSessions([
        { id: "1", date: "2024-01-15", className: "Data Structures", classCode: "CS201", topic: "Binary Trees", totalPresent: 42, totalAbsent: 3, totalStudents: 45 },
        { id: "2", date: "2024-01-14", className: "Algorithms", classCode: "CS301", topic: "Dynamic Programming", totalPresent: 35, totalAbsent: 3, totalStudents: 38 },
        { id: "3", date: "2024-01-14", className: "Data Structures", classCode: "CS201", topic: "Tree Traversal", totalPresent: 40, totalAbsent: 5, totalStudents: 45 },
        { id: "4", date: "2024-01-13", className: "Web Development", classCode: "CS250", topic: "React Components", totalPresent: 48, totalAbsent: 4, totalStudents: 52 },
        { id: "5", date: "2024-01-12", className: "Algorithms", classCode: "CS301", topic: "Greedy Algorithms", totalPresent: 36, totalAbsent: 2, totalStudents: 38 },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const startMarkingAttendance = (classCode: string, className: string) => {
    // Simulate loading students for the class
    const students: Student[] = [
      { id: "1", name: "Alice Johnson", email: "alice@university.edu", enrollmentNumber: "2024CS001", status: null },
      { id: "2", name: "Bob Smith", email: "bob@university.edu", enrollmentNumber: "2024CS002", status: null },
      { id: "3", name: "Carol Williams", email: "carol@university.edu", enrollmentNumber: "2024CS003", status: null },
      { id: "4", name: "David Brown", email: "david@university.edu", enrollmentNumber: "2024CS004", status: null },
      { id: "5", name: "Eva Martinez", email: "eva@university.edu", enrollmentNumber: "2024CS005", status: null },
      { id: "6", name: "Frank Lee", email: "frank@university.edu", enrollmentNumber: "2024CS006", status: null },
    ]
    
    setCurrentSession({
      className,
      classCode,
      topic: "",
      students
    })
    setIsMarkingAttendance(true)
  }

  const updateStudentStatus = (studentId: string, status: Student["status"]) => {
    if (!currentSession) return
    setCurrentSession({
      ...currentSession,
      students: currentSession.students.map(s =>
        s.id === studentId ? { ...s, status } : s
      )
    })
  }

  const markAllPresent = () => {
    if (!currentSession) return
    setCurrentSession({
      ...currentSession,
      students: currentSession.students.map(s => ({ ...s, status: "present" }))
    })
  }

  const saveAttendance = () => {
    if (!currentSession) return
    
    const unmarked = currentSession.students.filter(s => s.status === null)
    if (unmarked.length > 0) {
      toast({
        title: "Warning",
        description: `${unmarked.length} student(s) not marked. Please mark all students.`,
        variant: "destructive",
      })
      return
    }

    if (!currentSession.topic) {
      toast({
        title: "Error",
        description: "Please enter the session topic.",
        variant: "destructive",
      })
      return
    }

    const newSession: AttendanceSession = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      className: currentSession.className,
      classCode: currentSession.classCode,
      topic: currentSession.topic,
      totalPresent: currentSession.students.filter(s => s.status === "present" || s.status === "late").length,
      totalAbsent: currentSession.students.filter(s => s.status === "absent").length,
      totalStudents: currentSession.students.length,
    }

    setSessions([newSession, ...sessions])
    setIsMarkingAttendance(false)
    setCurrentSession(null)
    toast({
      title: "Attendance saved",
      description: `Attendance for ${currentSession.className} has been recorded.`,
    })
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase()
  }

  const filteredSessions = sessions.filter(s =>
    selectedClass === "all" || s.classCode === selectedClass
  )

  const uniqueClasses = [...new Set(sessions.map(s => ({ code: s.classCode, name: s.className })))]

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

  if (isMarkingAttendance && currentSession) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
            <p className="text-gray-500 mt-1">{currentSession.className} ({currentSession.classCode})</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsMarkingAttendance(false)}>Cancel</Button>
            <Button onClick={saveAttendance}>
              <Save className="w-4 h-4 mr-2" />
              Save Attendance
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Session Topic *</label>
                <Input
                  placeholder="e.g., Binary Trees"
                  value={currentSession.topic}
                  onChange={(e) => setCurrentSession({ ...currentSession, topic: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={markAllPresent}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark All Present
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {currentSession.students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.enrollmentNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={student.status === "present" ? "default" : "outline"}
                      className={student.status === "present" ? "bg-green-600 hover:bg-green-700" : ""}
                      onClick={() => updateStudentStatus(student.id, "present")}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={student.status === "absent" ? "default" : "outline"}
                      className={student.status === "absent" ? "bg-red-600 hover:bg-red-700" : ""}
                      onClick={() => updateStudentStatus(student.id, "absent")}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={student.status === "late" ? "default" : "outline"}
                      className={student.status === "late" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                      onClick={() => updateStudentStatus(student.id, "late")}
                    >
                      <Clock className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={student.status === "excused" ? "default" : "outline"}
                      className={student.status === "excused" ? "bg-blue-600 hover:bg-blue-700" : ""}
                      onClick={() => updateStudentStatus(student.id, "excused")}
                    >
                      <AlertCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Present: {currentSession.students.filter(s => s.status === "present").length}
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Absent: {currentSession.students.filter(s => s.status === "absent").length}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  Late: {currentSession.students.filter(s => s.status === "late").length}
                </span>
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Excused: {currentSession.students.filter(s => s.status === "excused").length}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {currentSession.students.filter(s => s.status !== null).length}/{currentSession.students.length} marked
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 mt-1">Track and manage class attendance</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Mark Attendance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Class</DialogTitle>
              <DialogDescription>Choose a class to mark attendance</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {uniqueClasses.map((cls, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => {
                    startMarkingAttendance(cls.code, cls.name)
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <CheckSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{cls.name}</p>
                      <p className="text-sm text-gray-500">{cls.code}</p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {(sessions.reduce((acc, s) => acc + (s.totalPresent / s.totalStudents * 100), 0) / sessions.length || 0).toFixed(1)}%
                </p>
                <p className="text-sm text-green-600">Average Attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{sessions.length}</p>
                <p className="text-sm text-blue-600">Sessions Recorded</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700">{uniqueClasses.length}</p>
                <p className="text-sm text-purple-600">Active Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map((cls, idx) => (
                  <SelectItem key={idx} value={cls.code}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="sm:ml-auto">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-purple-600" />
            Attendance History
          </CardTitle>
          <CardDescription>
            {filteredSessions.length} session{filteredSessions.length !== 1 ? "s" : ""} recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{session.className}</p>
                    <p className="text-sm text-gray-500">{session.topic}</p>
                  </div>
                </div>
                <div className="flex-1 flex flex-wrap gap-4 sm:justify-end items-center">
                  <Badge variant="outline">{session.classCode}</Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(session.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-green-600">{session.totalPresent} present</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm font-medium text-red-600">{session.totalAbsent} absent</span>
                  </div>
                  <Badge variant={session.totalPresent / session.totalStudents >= 0.9 ? "default" : "secondary"}>
                    {((session.totalPresent / session.totalStudents) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
