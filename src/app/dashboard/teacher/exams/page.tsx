"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ClipboardCheck,
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  Play,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  Settings,
  Copy,
  ChevronRight,
  BookOpen,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { SkeletonTable } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate } from "@/lib/utils"

interface Exam {
  id: string
  title: string
  description?: string
  type: "QUIZ" | "MIDTERM" | "FINAL" | "PRACTICE"
  classId: string
  className: string
  classCode: string
  duration: number
  totalMarks: number
  passingMarks?: number
  startTime: string
  endTime: string
  questionsCount: number
  isActive: boolean
  shuffleQuestions: boolean
  showResults: boolean
  _count: {
    attempts: number
    completed: number
  }
  totalStudents: number
  avgScore?: number
}

interface Question {
  id: string
  type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER"
  question: string
  options?: string[]
  answer: string
  marks: number
  explanation?: string
}

export default function TeacherExamsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [exams, setExams] = useState<Exam[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showQuestionsDialog, setShowQuestionsDialog] = useState(false)
  const [showAddQuestionDialog, setShowAddQuestionDialog] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [creating, setCreating] = useState(false)

  const [newExam, setNewExam] = useState({
    title: "",
    description: "",
    type: "QUIZ",
    classId: "",
    duration: "30",
    totalMarks: "50",
    passingMarks: "25",
    startTime: "",
    endTime: "",
    shuffleQuestions: true,
    showResults: true,
  })

  const [newQuestion, setNewQuestion] = useState({
    type: "MCQ" as const,
    question: "",
    options: ["", "", "", ""],
    answer: "",
    marks: "5",
    explanation: "",
  })

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setExams([
        {
          id: "1",
          title: "Data Structures Quiz 1",
          description: "Test on arrays, linked lists, and stacks",
          type: "QUIZ",
          classId: "c1",
          className: "Data Structures & Algorithms",
          classCode: "CS201",
          duration: 30,
          totalMarks: 50,
          passingMarks: 25,
          startTime: new Date(Date.now() - 86400000).toISOString(),
          endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
          questionsCount: 20,
          isActive: true,
          shuffleQuestions: true,
          showResults: true,
          _count: { attempts: 45, completed: 38 },
          totalStudents: 58,
          avgScore: 78,
        },
        {
          id: "2",
          title: "Database Midterm",
          description: "Comprehensive test on SQL and normalization",
          type: "MIDTERM",
          classId: "c2",
          className: "Database Systems",
          classCode: "CS301",
          duration: 120,
          totalMarks: 100,
          passingMarks: 40,
          startTime: new Date(Date.now() + 86400000 * 5).toISOString(),
          endTime: new Date(Date.now() + 86400000 * 5 + 7200000).toISOString(),
          questionsCount: 40,
          isActive: true,
          shuffleQuestions: true,
          showResults: false,
          _count: { attempts: 0, completed: 0 },
          totalStudents: 45,
        },
        {
          id: "3",
          title: "Programming Practice Test",
          description: "Practice questions for interview preparation",
          type: "PRACTICE",
          classId: "c1",
          className: "Data Structures & Algorithms",
          classCode: "CS201",
          duration: 60,
          totalMarks: 100,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 86400000 * 30).toISOString(),
          questionsCount: 25,
          isActive: true,
          shuffleQuestions: false,
          showResults: true,
          _count: { attempts: 52, completed: 48 },
          totalStudents: 58,
          avgScore: 82,
        },
      ])

      setQuestions([
        { id: "q1", type: "MCQ", question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: "O(log n)", marks: 5, explanation: "Binary search divides the search space in half each time." },
        { id: "q2", type: "TRUE_FALSE", question: "A stack follows LIFO principle.", options: ["True", "False"], answer: "True", marks: 2 },
        { id: "q3", type: "MCQ", question: "Which data structure uses FIFO?", options: ["Stack", "Queue", "Tree", "Graph"], answer: "Queue", marks: 5 },
      ])

      setLoading(false)
    }
    loadData()
  }, [])

  const handleCreateExam = async () => {
    if (!newExam.title || !newExam.classId || !newExam.startTime || !newExam.endTime) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" })
      return
    }

    setCreating(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    toast({ title: "Success", description: "Exam created successfully. Now add questions." })
    setShowCreateDialog(false)
    setNewExam({
      title: "", description: "", type: "QUIZ", classId: "", duration: "30",
      totalMarks: "50", passingMarks: "25", startTime: "", endTime: "",
      shuffleQuestions: true, showResults: true,
    })
    setCreating(false)
  }

  const handleAddQuestion = () => {
    if (!newQuestion.question || !newQuestion.answer) {
      toast({ title: "Error", description: "Please fill question and answer", variant: "destructive" })
      return
    }

    setQuestions(prev => [...prev, {
      id: `q-${Date.now()}`,
      ...newQuestion,
      marks: parseInt(newQuestion.marks),
    }])

    toast({ title: "Success", description: "Question added" })
    setNewQuestion({
      type: "MCQ", question: "", options: ["", "", "", ""],
      answer: "", marks: "5", explanation: "",
    })
  }

  const filteredExams = exams.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         e.className.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || e.type === typeFilter
    return matchesSearch && matchesType
  })

  const getExamStatus = (exam: Exam) => {
    const now = new Date()
    const start = new Date(exam.startTime)
    const end = new Date(exam.endTime)
    
    if (now < start) return { status: "UPCOMING", color: "bg-blue-100 text-blue-700" }
    if (now > end) return { status: "ENDED", color: "bg-gray-100 text-gray-700" }
    return { status: "ACTIVE", color: "bg-green-100 text-green-700" }
  }

  const stats = {
    total: exams.length,
    active: exams.filter(e => {
      const now = new Date()
      return new Date(e.startTime) <= now && now <= new Date(e.endTime)
    }).length,
    upcoming: exams.filter(e => new Date(e.startTime) > new Date()).length,
    totalQuestions: exams.reduce((acc, e) => acc + e.questionsCount, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams & Quizzes</h1>
          <p className="text-gray-600">Create and manage exams with auto-grading</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Exam
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Exams", value: stats.total, icon: ClipboardCheck, color: "blue" },
          { label: "Active Now", value: stats.active, icon: Play, color: "green" },
          { label: "Upcoming", value: stats.upcoming, icon: Calendar, color: "purple" },
          { label: "Total Questions", value: stats.totalQuestions, icon: BookOpen, color: "orange" },
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
                    stat.color === "purple" && "bg-purple-100 text-purple-600",
                    stat.color === "orange" && "bg-orange-100 text-orange-600",
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
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="QUIZ">Quiz</SelectItem>
                <SelectItem value="MIDTERM">Midterm</SelectItem>
                <SelectItem value="FINAL">Final</SelectItem>
                <SelectItem value="PRACTICE">Practice</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Exams List */}
      {loading ? (
        <Card><CardContent className="p-6"><SkeletonTable /></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filteredExams.map((exam, index) => {
            const { status, color } = getExamStatus(exam)
            const completionRate = exam._count.completed / exam.totalStudents * 100 || 0

            return (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                            <ClipboardCheck className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                              <Badge className={color}>{status}</Badge>
                              <Badge variant="outline">{exam.type}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                              <BookOpen className="w-4 h-4" />
                              <span>{exam.className}</span>
                              <Badge variant="outline" className="font-mono text-xs">{exam.classCode}</Badge>
                            </div>
                            {exam.description && (
                              <p className="text-sm text-gray-600">{exam.description}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                        <div className="grid grid-cols-3 gap-4 text-center text-sm">
                          <div>
                            <p className="text-gray-500 text-xs">Duration</p>
                            <p className="font-medium">{exam.duration} min</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Questions</p>
                            <p className="font-medium">{exam.questionsCount}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Marks</p>
                            <p className="font-medium">{exam.totalMarks}</p>
                          </div>
                        </div>

                        <div className="w-32">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Completion</span>
                            <span className="font-medium">{exam._count.completed}/{exam.totalStudents}</span>
                          </div>
                          <Progress value={completionRate} className="h-2" />
                          {exam.avgScore && (
                            <p className="text-xs text-gray-500 mt-1">Avg: {exam.avgScore}%</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSelectedExam(exam); setShowQuestionsDialog(true) }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Questions
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
                                Edit Exam
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="mr-2 h-4 w-4" />
                                View Results
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                              </DropdownMenuItem>
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
        </div>
      )}

      {/* Create Exam Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Exam</DialogTitle>
            <DialogDescription>Create an exam with auto-grading for MCQ questions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="e.g., Data Structures Quiz 1"
                value={newExam.title}
                onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Enter exam description..."
                value={newExam.description}
                onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={newExam.type} onValueChange={(v) => setNewExam({ ...newExam, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUIZ">Quiz</SelectItem>
                    <SelectItem value="MIDTERM">Midterm</SelectItem>
                    <SelectItem value="FINAL">Final</SelectItem>
                    <SelectItem value="PRACTICE">Practice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class *</Label>
                <Select value={newExam.classId} onValueChange={(v) => setNewExam({ ...newExam, classId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="c1">CS201 - Data Structures</SelectItem>
                    <SelectItem value="c2">CS301 - Database Systems</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  value={newExam.duration}
                  onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Total Marks</Label>
                <Input
                  type="number"
                  value={newExam.totalMarks}
                  onChange={(e) => setNewExam({ ...newExam, totalMarks: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Passing Marks</Label>
                <Input
                  type="number"
                  value={newExam.passingMarks}
                  onChange={(e) => setNewExam({ ...newExam, passingMarks: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input
                  type="datetime-local"
                  value={newExam.startTime}
                  onChange={(e) => setNewExam({ ...newExam, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time *</Label>
                <Input
                  type="datetime-local"
                  value={newExam.endTime}
                  onChange={(e) => setNewExam({ ...newExam, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Shuffle Questions</Label>
                  <p className="text-xs text-gray-500">Randomize question order for each student</p>
                </div>
                <Switch
                  checked={newExam.shuffleQuestions}
                  onCheckedChange={(v) => setNewExam({ ...newExam, shuffleQuestions: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Results</Label>
                  <p className="text-xs text-gray-500">Allow students to see results after submission</p>
                </div>
                <Switch
                  checked={newExam.showResults}
                  onCheckedChange={(v) => setNewExam({ ...newExam, showResults: v })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateExam} disabled={creating}>
              {creating ? "Creating..." : "Create Exam"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Questions Dialog */}
      <Dialog open={showQuestionsDialog} onOpenChange={setShowQuestionsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedExam?.title} - Questions</DialogTitle>
            <DialogDescription>
              Manage questions for this exam ({questions.length} questions)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowAddQuestionDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{question.type}</Badge>
                        <Badge>{question.marks} marks</Badge>
                      </div>
                      <p className="font-medium mb-2">{question.question}</p>
                      {question.options && (
                        <div className="space-y-1 mb-2">
                          {question.options.map((opt, i) => (
                            <div key={i} className={cn(
                              "text-sm px-3 py-1 rounded",
                              opt === question.answer ? "bg-green-100 text-green-700" : "bg-gray-50"
                            )}>
                              {String.fromCharCode(65 + i)}. {opt}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-green-600">Answer: {question.answer}</p>
                      {question.explanation && (
                        <p className="text-xs text-gray-500 mt-1">Explanation: {question.explanation}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={showAddQuestionDialog} onOpenChange={setShowAddQuestionDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newQuestion.type} onValueChange={(v: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER") => setNewQuestion({ ...newQuestion, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MCQ">Multiple Choice</SelectItem>
                    <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                    <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Marks</Label>
                <Input
                  type="number"
                  value={newQuestion.marks}
                  onChange={(e) => setNewQuestion({ ...newQuestion, marks: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Question *</Label>
              <Textarea
                placeholder="Enter your question..."
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              />
            </div>
            {newQuestion.type === "MCQ" && (
              <div className="space-y-2">
                <Label>Options</Label>
                {newQuestion.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-6">{String.fromCharCode(65 + i)}.</span>
                    <Input
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...newQuestion.options]
                        newOpts[i] = e.target.value
                        setNewQuestion({ ...newQuestion, options: newOpts })
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <Label>Correct Answer *</Label>
              {newQuestion.type === "MCQ" ? (
                <Select value={newQuestion.answer} onValueChange={(v) => setNewQuestion({ ...newQuestion, answer: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {newQuestion.options.filter(o => o).map((opt, i) => (
                      <SelectItem key={i} value={opt}>{String.fromCharCode(65 + i)}. {opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : newQuestion.type === "TRUE_FALSE" ? (
                <RadioGroup value={newQuestion.answer} onValueChange={(v) => setNewQuestion({ ...newQuestion, answer: v })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="True" id="true" />
                    <Label htmlFor="true">True</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="False" id="false" />
                    <Label htmlFor="false">False</Label>
                  </div>
                </RadioGroup>
              ) : (
                <Input
                  placeholder="Enter correct answer"
                  value={newQuestion.answer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Explanation (Optional)</Label>
              <Textarea
                placeholder="Explain the answer..."
                value={newQuestion.explanation}
                onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddQuestionDialog(false)}>Cancel</Button>
            <Button onClick={handleAddQuestion}>Add Question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
