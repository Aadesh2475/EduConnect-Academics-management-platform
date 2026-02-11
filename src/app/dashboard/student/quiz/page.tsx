"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ClipboardCheck,
  Search,
  Clock,
  Play,
  CheckCircle,
  AlertCircle,
  Trophy,
  Timer,
  BookOpen,
  ArrowRight,
  ChevronRight,
  Award,
  Target,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { SkeletonTable } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate } from "@/lib/utils"

interface Exam {
  id: string
  title: string
  description?: string
  type: "QUIZ" | "MIDTERM" | "FINAL" | "PRACTICE"
  className: string
  classCode: string
  duration: number
  totalMarks: number
  passingMarks?: number
  startTime: string
  endTime: string
  questionsCount: number
  status: "UPCOMING" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED" | "MISSED"
  attempt?: {
    startedAt?: string
    submittedAt?: string
    obtainedMarks?: number
    percentage?: number
  }
}

interface Question {
  id: string
  question: string
  type: "MCQ" | "TRUE_FALSE"
  options: string[]
  marks: number
}

export default function StudentQuizPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [exams, setExams] = useState<Exam[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [showExamDialog, setShowExamDialog] = useState(false)
  const [showResultDialog, setShowResultDialog] = useState(false)
  
  // Exam taking state
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadExams = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setExams([
        {
          id: "1",
          title: "Data Structures Quiz 1",
          description: "Test your understanding of arrays, linked lists, and stacks",
          type: "QUIZ",
          className: "Data Structures & Algorithms",
          classCode: "CS201",
          duration: 30,
          totalMarks: 50,
          passingMarks: 25,
          startTime: new Date(Date.now() - 86400000).toISOString(),
          endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
          questionsCount: 20,
          status: "AVAILABLE",
        },
        {
          id: "2",
          title: "Calculus Midterm Exam",
          description: "Comprehensive test covering integration and differentiation",
          type: "MIDTERM",
          className: "Advanced Mathematics",
          classCode: "MATH401",
          duration: 120,
          totalMarks: 100,
          passingMarks: 40,
          startTime: new Date(Date.now() + 86400000 * 5).toISOString(),
          endTime: new Date(Date.now() + 86400000 * 5 + 7200000).toISOString(),
          questionsCount: 40,
          status: "UPCOMING",
        },
        {
          id: "3",
          title: "SQL Basics Quiz",
          description: "Test your SQL query writing skills",
          type: "QUIZ",
          className: "Database Systems",
          classCode: "CS301",
          duration: 45,
          totalMarks: 40,
          passingMarks: 20,
          startTime: new Date(Date.now() - 86400000 * 3).toISOString(),
          endTime: new Date(Date.now() - 86400000).toISOString(),
          questionsCount: 15,
          status: "COMPLETED",
          attempt: {
            startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            submittedAt: new Date(Date.now() - 86400000 * 2 + 2400000).toISOString(),
            obtainedMarks: 36,
            percentage: 90,
          }
        },
        {
          id: "4",
          title: "Programming Practice Test",
          description: "Practice questions for coding interview preparation",
          type: "PRACTICE",
          className: "Data Structures & Algorithms",
          classCode: "CS201",
          duration: 60,
          totalMarks: 100,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 86400000 * 30).toISOString(),
          questionsCount: 25,
          status: "AVAILABLE",
        },
        {
          id: "5",
          title: "Linear Algebra Quiz",
          type: "QUIZ",
          className: "Advanced Mathematics",
          classCode: "MATH401",
          duration: 30,
          totalMarks: 30,
          passingMarks: 15,
          startTime: new Date(Date.now() - 86400000 * 5).toISOString(),
          endTime: new Date(Date.now() - 86400000 * 4).toISOString(),
          questionsCount: 10,
          status: "MISSED",
        },
      ])
      setLoading(false)
    }
    loadExams()
  }, [])

  // Demo questions for exam
  const demoQuestions: Question[] = [
    {
      id: "q1",
      question: "What is the time complexity of binary search?",
      type: "MCQ",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      marks: 5,
    },
    {
      id: "q2",
      question: "A stack follows LIFO (Last In First Out) principle.",
      type: "TRUE_FALSE",
      options: ["True", "False"],
      marks: 2,
    },
    {
      id: "q3",
      question: "Which data structure uses FIFO?",
      type: "MCQ",
      options: ["Stack", "Queue", "Tree", "Graph"],
      marks: 5,
    },
    {
      id: "q4",
      question: "What is the worst-case time complexity of quicksort?",
      type: "MCQ",
      options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
      marks: 5,
    },
    {
      id: "q5",
      question: "A linked list allows random access to elements.",
      type: "TRUE_FALSE",
      options: ["True", "False"],
      marks: 3,
    },
  ]

  const handleStartExam = () => {
    if (!selectedExam) return
    setQuestions(demoQuestions)
    setTimeLeft(selectedExam.duration * 60)
    setAnswers({})
    setCurrentQuestion(0)
    setShowStartDialog(false)
    setShowExamDialog(true)
  }

  useEffect(() => {
    if (showExamDialog && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [showExamDialog, timeLeft])

  const handleSubmitExam = async () => {
    setSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Calculate score (demo)
    const correctAnswers = { q1: "O(log n)", q2: "True", q3: "Queue", q4: "O(n²)", q5: "False" }
    let score = 0
    questions.forEach(q => {
      if (answers[q.id] === (correctAnswers as any)[q.id]) {
        score += q.marks
      }
    })
    
    setShowExamDialog(false)
    setShowResultDialog(true)
    setSubmitting(false)
    toast({ title: "Exam Submitted", description: `Your score: ${score}/${questions.reduce((a, q) => a + q.marks, 0)}` })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusBadge = (status: Exam["status"]) => {
    const variants = {
      UPCOMING: { variant: "outline" as const, icon: Clock, text: "Upcoming", color: "text-gray-600" },
      AVAILABLE: { variant: "success" as const, icon: Play, text: "Start Now", color: "text-green-600" },
      IN_PROGRESS: { variant: "default" as const, icon: Timer, text: "In Progress", color: "text-blue-600" },
      COMPLETED: { variant: "secondary" as const, icon: CheckCircle, text: "Completed", color: "text-gray-600" },
      MISSED: { variant: "destructive" as const, icon: AlertCircle, text: "Missed", color: "text-red-600" },
    }
    const config = variants[status]
    return (
      <Badge variant={config.variant} className={cn("gap-1", config.color)}>
        <config.icon className="w-3 h-3" />
        {config.text}
      </Badge>
    )
  }

  const getTypeBadge = (type: Exam["type"]) => {
    const colors = {
      QUIZ: "bg-blue-100 text-blue-700",
      MIDTERM: "bg-purple-100 text-purple-700",
      FINAL: "bg-red-100 text-red-700",
      PRACTICE: "bg-green-100 text-green-700",
    }
    return <Badge className={colors[type]}>{type}</Badge>
  }

  const filteredExams = exams.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         e.className.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || e.type === typeFilter
    return matchesSearch && matchesType
  })

  const stats = {
    total: exams.length,
    available: exams.filter(e => e.status === "AVAILABLE").length,
    completed: exams.filter(e => e.status === "COMPLETED").length,
    avgScore: Math.round(
      exams.filter(e => e.attempt?.percentage).reduce((acc, e) => acc + (e.attempt?.percentage || 0), 0) /
      (exams.filter(e => e.attempt?.percentage).length || 1)
    ),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quizzes & Exams</h1>
        <p className="text-gray-600">Take quizzes and view your exam results</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Exams", value: stats.total, icon: ClipboardCheck, color: "blue" },
          { label: "Available Now", value: stats.available, icon: Play, color: "green" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, color: "purple" },
          { label: "Average Score", value: `${stats.avgScore}%`, icon: Trophy, color: "orange" },
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
      ) : filteredExams.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardCheck className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No exams found</h3>
            <p className="text-gray-500">Check back later for new exams</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredExams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "hover:shadow-md transition-shadow",
                  exam.status === "AVAILABLE" && "border-green-200 bg-green-50/30"
                )}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                            exam.status === "AVAILABLE" ? "bg-green-100" :
                            exam.status === "COMPLETED" ? "bg-blue-100" : "bg-gray-100"
                          )}>
                            <ClipboardCheck className={cn(
                              "w-5 h-5",
                              exam.status === "AVAILABLE" ? "text-green-600" :
                              exam.status === "COMPLETED" ? "text-blue-600" : "text-gray-600"
                            )} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                              {getTypeBadge(exam.type)}
                              {getStatusBadge(exam.status)}
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

                        {exam.attempt && (
                          <div className="text-center bg-blue-50 px-4 py-2 rounded-lg">
                            <p className="text-xs text-gray-500">Your Score</p>
                            <p className="text-xl font-bold text-blue-600">
                              {exam.attempt.obtainedMarks}/{exam.totalMarks}
                            </p>
                            <p className="text-xs text-gray-500">{exam.attempt.percentage}%</p>
                          </div>
                        )}

                        {exam.status === "AVAILABLE" && (
                          <Button onClick={() => { setSelectedExam(exam); setShowStartDialog(true) }}>
                            <Play className="w-4 h-4 mr-1" />
                            Start Exam
                          </Button>
                        )}
                        {exam.status === "UPCOMING" && (
                          <Button variant="outline" disabled>
                            <Clock className="w-4 h-4 mr-1" />
                            Starts {formatDate(new Date(exam.startTime))}
                          </Button>
                        )}
                        {exam.status === "COMPLETED" && (
                          <Button variant="outline">
                            View Results
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Start Exam Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Exam</DialogTitle>
            <DialogDescription>
              Are you ready to begin {selectedExam?.title}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong>
              </p>
              <ul className="text-sm text-yellow-700 list-disc list-inside mt-2 space-y-1">
                <li>You have {selectedExam?.duration} minutes to complete this exam</li>
                <li>The exam will auto-submit when time runs out</li>
                <li>You cannot pause or restart once you begin</li>
                <li>Make sure you have a stable internet connection</li>
              </ul>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Questions</p>
                <p className="font-bold">{selectedExam?.questionsCount}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Duration</p>
                <p className="font-bold">{selectedExam?.duration} min</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Total Marks</p>
                <p className="font-bold">{selectedExam?.totalMarks}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartDialog(false)}>Cancel</Button>
            <Button onClick={handleStartExam}>
              <Play className="w-4 h-4 mr-1" />
              Start Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exam Taking Dialog */}
      <Dialog open={showExamDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{selectedExam?.title}</DialogTitle>
              <div className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full font-mono text-lg",
                timeLeft <= 300 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
              )}>
                <Timer className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Object.keys(answers).length} answered</span>
              </div>
              <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
            </div>

            {/* Question */}
            {questions[currentQuestion] && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                      {currentQuestion + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline">{questions[currentQuestion].type}</Badge>
                        <Badge>{questions[currentQuestion].marks} marks</Badge>
                      </div>
                      <p className="text-lg font-medium mb-4">{questions[currentQuestion].question}</p>
                      
                      <RadioGroup
                        value={answers[questions[currentQuestion].id] || ""}
                        onValueChange={(value) => setAnswers({ ...answers, [questions[currentQuestion].id]: value })}
                      >
                        <div className="space-y-3">
                          {questions[currentQuestion].options.map((option, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors",
                                answers[questions[currentQuestion].id] === option
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              )}
                              onClick={() => setAnswers({ ...answers, [questions[currentQuestion].id]: option })}
                            >
                              <RadioGroupItem value={option} id={`option-${idx}`} />
                              <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question Navigation */}
            <div className="flex flex-wrap gap-2">
              {questions.map((q, idx) => (
                <Button
                  key={q.id}
                  variant={idx === currentQuestion ? "default" : answers[q.id] ? "secondary" : "outline"}
                  size="sm"
                  className="w-10 h-10"
                  onClick={() => setCurrentQuestion(idx)}
                >
                  {idx + 1}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            {currentQuestion < questions.length - 1 ? (
              <Button onClick={() => setCurrentQuestion(prev => prev + 1)}>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmitExam} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Exam"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exam Submitted!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-lg font-medium mb-2">Your exam has been submitted successfully!</p>
            <p className="text-gray-500">Results will be available once graded.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowResultDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
