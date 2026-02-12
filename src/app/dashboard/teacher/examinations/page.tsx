"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  Users,
  Edit2,
  Trash2,
  Eye,
  BarChart3,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface Exam {
  id: string
  title: string
  className: string
  classCode: string
  type: "quiz" | "midterm" | "final" | "practice"
  duration: number
  totalMarks: number
  questions: number
  startDate: string
  endDate: string
  status: "draft" | "scheduled" | "active" | "completed"
  attempts: number
  avgScore?: number
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  scheduled: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-purple-100 text-purple-800",
}

const typeColors = {
  quiz: "bg-blue-100 text-blue-800",
  midterm: "bg-orange-100 text-orange-800",
  final: "bg-red-100 text-red-800",
  practice: "bg-green-100 text-green-800",
}

export default function TeacherExaminationsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [exams, setExams] = useState<Exam[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [newExam, setNewExam] = useState({
    title: "",
    classCode: "",
    type: "quiz" as const,
    duration: 60,
    totalMarks: 100,
    startDate: "",
    endDate: "",
  })

  const availableClasses = [
    { code: "CS201", name: "Data Structures" },
    { code: "CS301", name: "Algorithms" },
    { code: "CS250", name: "Web Development" },
  ]

  useEffect(() => {
    setTimeout(() => {
      const today = new Date()
      setExams([
        { id: "1", title: "Quiz 1: Binary Trees", className: "Data Structures", classCode: "CS201", type: "quiz", duration: 30, totalMarks: 20, questions: 10, startDate: new Date(today.getTime() + 86400000).toISOString(), endDate: new Date(today.getTime() + 86400000 * 2).toISOString(), status: "scheduled", attempts: 0 },
        { id: "2", title: "Midterm Examination", className: "Data Structures", classCode: "CS201", type: "midterm", duration: 120, totalMarks: 100, questions: 25, startDate: new Date(today.getTime() + 86400000 * 7).toISOString(), endDate: new Date(today.getTime() + 86400000 * 8).toISOString(), status: "scheduled", attempts: 0 },
        { id: "3", title: "Practice Test: Dynamic Programming", className: "Algorithms", classCode: "CS301", type: "practice", duration: 45, totalMarks: 30, questions: 15, startDate: today.toISOString(), endDate: new Date(today.getTime() + 86400000 * 3).toISOString(), status: "active", attempts: 28 },
        { id: "4", title: "Quiz 2: Sorting Algorithms", className: "Algorithms", classCode: "CS301", type: "quiz", duration: 30, totalMarks: 20, questions: 10, startDate: new Date(today.getTime() - 86400000 * 5).toISOString(), endDate: new Date(today.getTime() - 86400000 * 4).toISOString(), status: "completed", attempts: 35, avgScore: 78.5 },
        { id: "5", title: "Final Project Assessment", className: "Web Development", classCode: "CS250", type: "final", duration: 180, totalMarks: 200, questions: 5, startDate: "", endDate: "", status: "draft", attempts: 0 },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const handleCreateExam = () => {
    if (!newExam.title || !newExam.classCode) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const className = availableClasses.find(c => c.code === newExam.classCode)?.name || "Unknown"
    
    const exam: Exam = {
      id: Date.now().toString(),
      title: newExam.title,
      className,
      classCode: newExam.classCode,
      type: newExam.type,
      duration: newExam.duration,
      totalMarks: newExam.totalMarks,
      questions: 0,
      startDate: newExam.startDate,
      endDate: newExam.endDate,
      status: "draft",
      attempts: 0,
    }

    setExams([exam, ...exams])
    setNewExam({ title: "", classCode: "", type: "quiz", duration: 60, totalMarks: 100, startDate: "", endDate: "" })
    setIsCreateOpen(false)
    toast({
      title: "Exam created",
      description: "Your exam has been created as a draft. Add questions to publish it.",
    })
  }

  const handleDelete = (id: string) => {
    setExams(exams.filter(e => e.id !== id))
    toast({
      title: "Exam deleted",
      description: "The exam has been removed.",
      variant: "destructive",
    })
  }

  const filteredExams = exams.filter(exam =>
    selectedStatus === "all" || exam.status === selectedStatus
  )

  const draftExams = exams.filter(e => e.status === "draft")
  const scheduledExams = exams.filter(e => e.status === "scheduled")
  const activeExams = exams.filter(e => e.status === "active")
  const completedExams = exams.filter(e => e.status === "completed")

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
          <h1 className="text-3xl font-bold text-gray-900">Examinations</h1>
          <p className="text-gray-500 mt-1">Create and manage exams and quizzes</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
              <DialogDescription>Set up a new exam or quiz</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={newExam.title}
                  onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                  placeholder="Exam title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class *</Label>
                  <Select
                    value={newExam.classCode}
                    onValueChange={(value) => setNewExam({ ...newExam, classCode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableClasses.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newExam.type}
                    onValueChange={(value: any) => setNewExam({ ...newExam, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="midterm">Midterm</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={newExam.duration}
                    onChange={(e) => setNewExam({ ...newExam, duration: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Marks</Label>
                  <Input
                    type="number"
                    value={newExam.totalMarks}
                    onChange={(e) => setNewExam({ ...newExam, totalMarks: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="datetime-local"
                    value={newExam.startDate}
                    onChange={(e) => setNewExam({ ...newExam, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="datetime-local"
                    value={newExam.endDate}
                    onChange={(e) => setNewExam({ ...newExam, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateExam}>Create Exam</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{draftExams.length}</p>
                <p className="text-xs text-gray-500">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{scheduledExams.length}</p>
                <p className="text-xs text-gray-500">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeExams.length}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedExams.length}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exams</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Exams List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Exams & Quizzes
          </CardTitle>
          <CardDescription>
            {filteredExams.length} exam{filteredExams.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredExams.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No exams found</h3>
              <p className="text-gray-500">Create your first exam to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-4 rounded-lg border hover:bg-gray-50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                        <Badge className={statusColors[exam.status]}>{exam.status}</Badge>
                        <Badge className={typeColors[exam.type]}>{exam.type}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Badge variant="outline">{exam.classCode}</Badge>
                          {exam.className}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {exam.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {exam.questions} questions
                        </span>
                        <span>{exam.totalMarks} marks</span>
                      </div>
                      {exam.startDate && (
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {exam.status === "completed" && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{exam.attempts} attempts</p>
                          {exam.avgScore && (
                            <p className="text-xs text-gray-500">Avg: {exam.avgScore}%</p>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(exam.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
