"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Download,
  Upload,
  Award,
  BookOpen,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SkeletonTable } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { getInitials, cn, formatDate } from "@/lib/utils"

interface Assignment {
  id: string
  title: string
  description: string
  classId: string
  className: string
  classCode: string
  dueDate: string
  totalMarks: number
  isActive: boolean
  createdAt: string
  _count: {
    submissions: number
    graded: number
  }
  totalStudents: number
}

interface Submission {
  id: string
  student: {
    id: string
    user: {
      name: string
      email: string
      image?: string
    }
    enrollmentNo?: string
  }
  status: "PENDING" | "SUBMITTED" | "GRADED" | "LATE"
  submittedAt?: string
  content?: string
  marks?: number
  feedback?: string
}

export default function TeacherAssignmentsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSubmissionsDialog, setShowSubmissionsDialog] = useState(false)
  const [showGradeDialog, setShowGradeDialog] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [gradeForm, setGradeForm] = useState({ marks: "", feedback: "" })
  const [creating, setCreating] = useState(false)

  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    classId: "",
    dueDate: "",
    totalMarks: "100",
  })

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAssignments([
        {
          id: "1",
          title: "Binary Search Tree Implementation",
          description: "Implement a complete BST with insert, delete, and search operations",
          classId: "c1",
          className: "Data Structures & Algorithms",
          classCode: "CS201",
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          totalMarks: 100,
          isActive: true,
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          _count: { submissions: 42, graded: 28 },
          totalStudents: 58
        },
        {
          id: "2",
          title: "Database Design Project",
          description: "Design a normalized database schema for an e-commerce application",
          classId: "c2",
          className: "Database Systems",
          classCode: "CS301",
          dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
          totalMarks: 150,
          isActive: true,
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          _count: { submissions: 18, graded: 5 },
          totalStudents: 45
        },
        {
          id: "3",
          title: "Sorting Algorithms Analysis",
          description: "Compare time complexity of different sorting algorithms",
          classId: "c1",
          className: "Data Structures & Algorithms",
          classCode: "CS201",
          dueDate: new Date(Date.now() - 86400000 * 2).toISOString(),
          totalMarks: 75,
          isActive: false,
          createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
          _count: { submissions: 55, graded: 55 },
          totalStudents: 58
        },
      ])

      setSubmissions([
        {
          id: "sub1",
          student: { id: "s1", user: { name: "Alice Johnson", email: "alice@example.com" }, enrollmentNo: "STU001" },
          status: "SUBMITTED",
          submittedAt: new Date(Date.now() - 3600000).toISOString(),
          content: "Here is my implementation of BST with all required operations...",
        },
        {
          id: "sub2",
          student: { id: "s2", user: { name: "Bob Smith", email: "bob@example.com" }, enrollmentNo: "STU002" },
          status: "GRADED",
          submittedAt: new Date(Date.now() - 86400000).toISOString(),
          content: "BST implementation with comprehensive test cases...",
          marks: 92,
          feedback: "Excellent work! Good implementation and test coverage."
        },
        {
          id: "sub3",
          student: { id: "s3", user: { name: "Carol Williams", email: "carol@example.com" }, enrollmentNo: "STU003" },
          status: "LATE",
          submittedAt: new Date(Date.now() - 7200000).toISOString(),
          content: "Late submission of BST...",
        },
        {
          id: "sub4",
          student: { id: "s4", user: { name: "David Brown", email: "david@example.com" }, enrollmentNo: "STU004" },
          status: "PENDING",
        },
      ])

      setLoading(false)
    }
    loadData()
  }, [])

  const handleCreateAssignment = async () => {
    if (!newAssignment.title || !newAssignment.classId || !newAssignment.dueDate) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" })
      return
    }

    setCreating(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    toast({ title: "Success", description: "Assignment created successfully" })
    setShowCreateDialog(false)
    setNewAssignment({ title: "", description: "", classId: "", dueDate: "", totalMarks: "100" })
    setCreating(false)
  }

  const handleGradeSubmission = async () => {
    if (!gradeForm.marks) {
      toast({ title: "Error", description: "Please enter marks", variant: "destructive" })
      return
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSubmissions(prev => prev.map(s => 
      s.id === selectedSubmission?.id 
        ? { ...s, status: "GRADED" as const, marks: parseInt(gradeForm.marks), feedback: gradeForm.feedback }
        : s
    ))

    toast({ title: "Success", description: "Submission graded successfully" })
    setShowGradeDialog(false)
    setGradeForm({ marks: "", feedback: "" })
    setSelectedSubmission(null)
  }

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.className.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClass = classFilter === "all" || a.classId === classFilter
    return matchesSearch && matchesClass
  })

  const stats = {
    total: assignments.length,
    active: assignments.filter(a => a.isActive).length,
    needsGrading: assignments.reduce((acc, a) => acc + (a._count.submissions - a._count.graded), 0),
    avgSubmission: Math.round(assignments.reduce((acc, a) => acc + (a._count.submissions / a.totalStudents * 100), 0) / assignments.length) || 0,
  }

  const classes = [...new Set(assignments.map(a => ({ id: a.classId, name: a.className, code: a.classCode })))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600">Create and manage assignments for your classes</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Assignments", value: stats.total, icon: FileText, color: "blue" },
          { label: "Active", value: stats.active, icon: CheckCircle, color: "green" },
          { label: "Needs Grading", value: stats.needsGrading, icon: Clock, color: "orange" },
          { label: "Avg Submission", value: `${stats.avgSubmission}%`, icon: Users, color: "purple" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    stat.color === "blue" && "bg-blue-100 text-blue-600",
                    stat.color === "green" && "bg-green-100 text-green-600",
                    stat.color === "orange" && "bg-orange-100 text-orange-600",
                    stat.color === "purple" && "bg-purple-100 text-purple-600",
                  )}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      {loading ? (
        <Card><CardContent className="p-6"><SkeletonTable /></CardContent></Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredAssignments.map((assignment, index) => {
              const submissionRate = Math.round((assignment._count.submissions / assignment.totalStudents) * 100)
              const gradingProgress = Math.round((assignment._count.graded / assignment._count.submissions) * 100) || 0
              const isOverdue = new Date(assignment.dueDate) < new Date()

              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={cn(
                    "hover:shadow-md transition-shadow",
                    !assignment.isActive && "opacity-60"
                  )}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                              assignment.isActive ? "bg-blue-100" : "bg-gray-100"
                            )}>
                              <FileText className={cn(
                                "w-5 h-5",
                                assignment.isActive ? "text-blue-600" : "text-gray-600"
                              )} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                                <Badge variant={assignment.isActive ? "success" : "secondary"}>
                                  {assignment.isActive ? "Active" : "Closed"}
                                </Badge>
                                {isOverdue && assignment.isActive && (
                                  <Badge variant="destructive">Overdue</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <BookOpen className="w-4 h-4" />
                                <span>{assignment.className}</span>
                                <Badge variant="outline" className="font-mono text-xs">{assignment.classCode}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-1">{assignment.description}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                          <div className="text-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>Due: {formatDate(new Date(assignment.dueDate))}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{assignment.totalMarks} marks</p>
                          </div>

                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">Submissions</span>
                              <span className="font-medium">{assignment._count.submissions}/{assignment.totalStudents}</span>
                            </div>
                            <Progress value={submissionRate} className="h-2" />
                          </div>

                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">Graded</span>
                              <span className="font-medium">{assignment._count.graded}/{assignment._count.submissions}</span>
                            </div>
                            <Progress value={gradingProgress} className="h-2 bg-orange-100" />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setSelectedAssignment(assignment); setShowSubmissionsDialog(true) }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Assignment
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download Submissions
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create Assignment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>Create a new assignment for your students</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="e.g., Binary Search Tree Implementation"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Enter assignment instructions..."
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class *</Label>
                <Select value={newAssignment.classId} onValueChange={(v) => setNewAssignment({ ...newAssignment, classId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="c1">CS201 - Data Structures</SelectItem>
                    <SelectItem value="c2">CS301 - Database Systems</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Total Marks *</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={newAssignment.totalMarks}
                  onChange={(e) => setNewAssignment({ ...newAssignment, totalMarks: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input
                type="datetime-local"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateAssignment} disabled={creating}>
              {creating ? "Creating..." : "Create Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submissions Dialog */}
      <Dialog open={showSubmissionsDialog} onOpenChange={setShowSubmissionsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.className} • {selectedAssignment?._count.submissions} submissions
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="submitted">
            <TabsList>
              <TabsTrigger value="submitted">Submitted ({submissions.filter(s => s.status !== "PENDING").length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({submissions.filter(s => s.status === "PENDING").length})</TabsTrigger>
              <TabsTrigger value="graded">Graded ({submissions.filter(s => s.status === "GRADED").length})</TabsTrigger>
            </TabsList>
            <TabsContent value="submitted" className="space-y-4 mt-4">
              {submissions.filter(s => s.status !== "PENDING").map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getInitials(submission.student.user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{submission.student.user.name}</p>
                          <p className="text-sm text-gray-500">{submission.student.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={
                          submission.status === "GRADED" ? "success" :
                          submission.status === "LATE" ? "destructive" : "default"
                        }>
                          {submission.status}
                        </Badge>
                        {submission.marks !== undefined && (
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">{submission.marks}</p>
                            <p className="text-xs text-gray-500">/{selectedAssignment?.totalMarks}</p>
                          </div>
                        )}
                        {submission.status !== "GRADED" && (
                          <Button
                            size="sm"
                            onClick={() => { setSelectedSubmission(submission); setShowGradeDialog(true) }}
                          >
                            <Award className="w-4 h-4 mr-1" />
                            Grade
                          </Button>
                        )}
                      </div>
                    </div>
                    {submission.content && (
                      <p className="text-sm text-gray-600 mt-3 p-3 bg-gray-50 rounded-lg line-clamp-2">
                        {submission.content}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="pending" className="space-y-4 mt-4">
              {submissions.filter(s => s.status === "PENDING").map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getInitials(submission.student.user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{submission.student.user.name}</p>
                          <p className="text-sm text-gray-500">{submission.student.user.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Not Submitted</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="graded" className="space-y-4 mt-4">
              {submissions.filter(s => s.status === "GRADED").map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getInitials(submission.student.user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{submission.student.user.name}</p>
                          <p className="text-sm text-gray-500">{submission.feedback}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{submission.marks}</p>
                        <p className="text-xs text-gray-500">/{selectedAssignment?.totalMarks}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmissionsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grade Dialog */}
      <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              Grading submission from {selectedSubmission?.student.user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSubmission?.content && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-xs text-gray-500">Submission</Label>
                <p className="text-sm mt-1">{selectedSubmission.content}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marks (out of {selectedAssignment?.totalMarks})</Label>
                <Input
                  type="number"
                  placeholder="Enter marks"
                  value={gradeForm.marks}
                  onChange={(e) => setGradeForm({ ...gradeForm, marks: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Feedback</Label>
              <Textarea
                placeholder="Enter feedback for the student..."
                value={gradeForm.feedback}
                onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGradeDialog(false)}>Cancel</Button>
            <Button onClick={handleGradeSubmission}>Submit Grade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
