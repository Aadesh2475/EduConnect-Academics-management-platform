"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Upload,
  Download,
  Eye,
  ChevronRight,
  Filter,
  BookOpen,
  Award,
  RefreshCw,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SkeletonTable } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate } from "@/lib/utils"

interface Assignment {
  id: string
  title: string
  description: string
  instructions?: string
  className: string
  classCode: string
  dueDate: string
  totalMarks: number
  status: "PENDING" | "SUBMITTED" | "GRADED" | "LATE" | "OVERDUE"
  submittedAt?: string
  marks?: number
  feedback?: string
  attachments?: string[]
}

interface AssignmentStats {
  total: number
  pending: number
  submitted: number
  graded: number
  overdue: number
  avgScore: number
}

export default function StudentAssignmentsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [stats, setStats] = useState<AssignmentStats>({
    total: 0, pending: 0, submitted: 0, graded: 0, overdue: 0, avgScore: 0
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [submissionText, setSubmissionText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const fetchAssignments = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/student/assignments${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`)
      const result = await res.json()
      
      if (result.success) {
        setAssignments(result.data)
        if (result.stats) {
          setStats(result.stats)
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load assignments",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [statusFilter])

  const handleSubmit = async () => {
    if (!submissionText.trim() && !selectedAssignment) {
      toast({ title: "Error", description: "Please enter your submission", variant: "destructive" })
      return
    }
    
    setSubmitting(true)
    try {
      const res = await fetch(`/api/assignments/${selectedAssignment?.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: submissionText, attachments: [] })
      })
      
      const result = await res.json()
      
      if (result.success) {
        toast({ title: "Success", description: "Assignment submitted successfully!" })
        setShowSubmitDialog(false)
        setSubmissionText("")
        setSelectedAssignment(null)
        fetchAssignments() // Refresh list
      } else {
        toast({ 
          title: "Error", 
          description: result.error || "Failed to submit assignment", 
          variant: "destructive" 
        })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit assignment", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: Assignment["status"]) => {
    const variants = {
      PENDING: { variant: "outline" as const, icon: Clock, text: "Pending", color: "text-gray-600" },
      SUBMITTED: { variant: "default" as const, icon: CheckCircle, text: "Submitted", color: "text-blue-600" },
      GRADED: { variant: "success" as const, icon: Award, text: "Graded", color: "text-green-600" },
      LATE: { variant: "outline" as const, icon: AlertCircle, text: "Late", color: "text-orange-600" },
      OVERDUE: { variant: "destructive" as const, icon: XCircle, text: "Overdue", color: "text-red-600" },
    }
    const config = variants[status]
    return (
      <Badge variant={config.variant} className={cn("gap-1", config.color)}>
        <config.icon className="w-3 h-3" />
        {config.text}
      </Badge>
    )
  }

  const getDaysRemaining = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - Date.now()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, urgent: true }
    if (days === 0) return { text: "Due today", urgent: true }
    if (days === 1) return { text: "Due tomorrow", urgent: true }
    return { text: `${days} days left`, urgent: days <= 3 }
  }

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.className.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600">View and submit your assignments</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchAssignments} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats.total, icon: FileText, color: "blue" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "orange" },
          { label: "Submitted", value: stats.submitted, icon: Upload, color: "purple" },
          { label: "Graded", value: stats.graded, icon: CheckCircle, color: "green" },
          { label: "Avg Score", value: `${stats.avgScore}%`, icon: Award, color: "cyan" },
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
                    stat.color === "orange" && "bg-orange-100 text-orange-600",
                    stat.color === "purple" && "bg-purple-100 text-purple-600",
                    stat.color === "green" && "bg-green-100 text-green-600",
                    stat.color === "cyan" && "bg-cyan-100 text-cyan-600",
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="GRADED">Graded</SelectItem>
                <SelectItem value="LATE">Late</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      {loading ? (
        <Card><CardContent className="p-6"><SkeletonTable /></CardContent></Card>
      ) : filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assignments found</h3>
            <p className="text-gray-500">
              {assignments.length === 0 
                ? "You don't have any assignments yet. Join a class to see assignments."
                : "No assignments match your search criteria"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredAssignments.map((assignment, index) => {
              const daysInfo = getDaysRemaining(assignment.dueDate)
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
                    assignment.status === "OVERDUE" && "border-red-200 bg-red-50/50"
                  )}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                              assignment.status === "GRADED" ? "bg-green-100" : 
                              assignment.status === "OVERDUE" ? "bg-red-100" : "bg-blue-100"
                            )}>
                              <FileText className={cn(
                                "w-5 h-5",
                                assignment.status === "GRADED" ? "text-green-600" :
                                assignment.status === "OVERDUE" ? "text-red-600" : "text-blue-600"
                              )} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                                {getStatusBadge(assignment.status)}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <BookOpen className="w-4 h-4" />
                                <span>{assignment.className}</span>
                                <Badge variant="outline" className="font-mono text-xs">{assignment.classCode}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">{assignment.description}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                          <div className="text-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>Due: {formatDate(new Date(assignment.dueDate))}</span>
                            </div>
                            <span className={cn(
                              "text-xs font-medium",
                              daysInfo.urgent ? "text-red-600" : "text-green-600"
                            )}>
                              {daysInfo.text}
                            </span>
                          </div>

                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Marks</p>
                            {assignment.marks !== undefined && assignment.marks !== null ? (
                              <p className="text-lg font-bold text-gray-900">
                                {assignment.marks}/{assignment.totalMarks}
                              </p>
                            ) : (
                              <p className="text-lg font-bold text-gray-400">-/{assignment.totalMarks}</p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setSelectedAssignment(assignment); setShowViewDialog(true) }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            {(assignment.status === "PENDING" || assignment.status === "OVERDUE") && (
                              <Button
                                size="sm"
                                onClick={() => { setSelectedAssignment(assignment); setShowSubmitDialog(true) }}
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                Submit
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {assignment.status === "GRADED" && assignment.feedback && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm font-medium text-green-800 mb-1">Feedback:</p>
                          <p className="text-sm text-green-700">{assignment.feedback}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* View Assignment Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.className} ({selectedAssignment?.classCode})
            </DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedAssignment.status)}
                <div className="text-sm text-gray-500">
                  Due: {formatDate(new Date(selectedAssignment.dueDate))}
                </div>
              </div>
              
              <div>
                <Label className="text-gray-500 text-xs">Description</Label>
                <p className="text-gray-700 mt-1">{selectedAssignment.description}</p>
              </div>

              {selectedAssignment.instructions && (
                <div>
                  <Label className="text-gray-500 text-xs">Instructions</Label>
                  <p className="text-gray-700 mt-1">{selectedAssignment.instructions}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500 text-xs">Total Marks</Label>
                  <p className="font-medium">{selectedAssignment.totalMarks}</p>
                </div>
                {selectedAssignment.marks !== undefined && selectedAssignment.marks !== null && (
                  <div>
                    <Label className="text-gray-500 text-xs">Obtained Marks</Label>
                    <p className="font-medium text-green-600">{selectedAssignment.marks}</p>
                  </div>
                )}
              </div>

              {selectedAssignment.feedback && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <Label className="text-gray-500 text-xs">Teacher Feedback</Label>
                  <p className="text-green-700 mt-1">{selectedAssignment.feedback}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
            {(selectedAssignment?.status === "PENDING" || selectedAssignment?.status === "OVERDUE") && (
              <Button onClick={() => { setShowViewDialog(false); setShowSubmitDialog(true) }}>
                Submit Assignment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Assignment Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>{selectedAssignment?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your Submission</Label>
              <Textarea
                placeholder="Enter your assignment submission..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <Label>Attachments (Optional)</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  Drag and drop files here, or click to browse
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Choose Files
                </Button>
              </div>
            </div>
            {selectedAssignment?.status === "OVERDUE" && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-700">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  This assignment is overdue. Late penalties may apply.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
