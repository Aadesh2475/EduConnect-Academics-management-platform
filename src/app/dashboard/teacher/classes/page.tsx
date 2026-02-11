"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  Plus,
  Search,
  Copy,
  Users,
  Calendar,
  Clock,
  FileText,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { getInitials, cn } from "@/lib/utils"

interface TeacherClass {
  id: string
  name: string
  code: string
  description?: string
  department: string
  semester: number
  subject: string
  isActive: boolean
  createdAt: string
  _count: {
    enrollments: number
    assignments: number
    exams: number
    materials: number
  }
  pendingRequests: number
}

interface JoinRequest {
  id: string
  student: {
    id: string
    user: {
      name: string
      email: string
      image?: string
    }
    enrollmentNo?: string
    department?: string
    semester?: number
  }
  createdAt: string
}

export default function TeacherClassesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showRequestsDialog, setShowRequestsDialog] = useState(false)
  const [selectedClass, setSelectedClass] = useState<TeacherClass | null>(null)
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [creating, setCreating] = useState(false)
  const [newClass, setNewClass] = useState({
    name: "",
    description: "",
    department: "",
    semester: "1",
    subject: "",
  })

  useEffect(() => {
    const loadClasses = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setClasses([
        {
          id: "1",
          name: "Data Structures & Algorithms",
          code: "CS201-A1B2",
          description: "Learn fundamental data structures and algorithmic techniques",
          department: "Computer Science",
          semester: 2,
          subject: "Programming",
          isActive: true,
          createdAt: new Date().toISOString(),
          _count: { enrollments: 58, assignments: 15, exams: 3, materials: 24 },
          pendingRequests: 5,
        },
        {
          id: "2",
          name: "Advanced Algorithms",
          code: "CS401-X3Y4",
          description: "Advanced algorithmic paradigms and optimization techniques",
          department: "Computer Science",
          semester: 4,
          subject: "Algorithms",
          isActive: true,
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          _count: { enrollments: 42, assignments: 12, exams: 2, materials: 18 },
          pendingRequests: 2,
        },
        {
          id: "3",
          name: "Introduction to Programming",
          code: "CS101-P5Q6",
          description: "Basic programming concepts and problem solving",
          department: "Computer Science",
          semester: 1,
          subject: "Programming",
          isActive: false,
          createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
          _count: { enrollments: 75, assignments: 20, exams: 4, materials: 30 },
          pendingRequests: 0,
        },
      ])
      setLoading(false)
    }
    loadClasses()
  }, [])

  const handleCreateClass = async () => {
    if (!newClass.name || !newClass.department || !newClass.subject) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }
    
    setCreating(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const code = `${newClass.department.substring(0, 2).toUpperCase()}${newClass.semester}01-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    toast({ title: "Success", description: `Class created with code: ${code}` })
    setShowCreateDialog(false)
    setNewClass({ name: "", description: "", department: "", semester: "1", subject: "" })
    setCreating(false)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({ title: "Copied!", description: `Class code ${code} copied to clipboard` })
  }

  const handleViewRequests = (cls: TeacherClass) => {
    setSelectedClass(cls)
    setJoinRequests([
      { id: "r1", student: { id: "s1", user: { name: "John Doe", email: "john@example.com" }, enrollmentNo: "STU001", department: "Computer Science", semester: 2 }, createdAt: new Date().toISOString() },
      { id: "r2", student: { id: "s2", user: { name: "Jane Smith", email: "jane@example.com" }, enrollmentNo: "STU002", department: "Computer Science", semester: 2 }, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "r3", student: { id: "s3", user: { name: "Mike Johnson", email: "mike@example.com" }, enrollmentNo: "STU003", department: "Computer Science", semester: 3 }, createdAt: new Date(Date.now() - 7200000).toISOString() },
    ])
    setShowRequestsDialog(true)
  }

  const handleRequestAction = (requestId: string, action: "approve" | "reject") => {
    setJoinRequests(prev => prev.filter(r => r.id !== requestId))
    toast({ title: action === "approve" ? "Approved" : "Rejected", description: `Student request ${action}d successfully` })
  }

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: classes.length,
    active: classes.filter(c => c.isActive).length,
    students: classes.reduce((acc, c) => acc + c._count.enrollments, 0),
    pendingRequests: classes.reduce((acc, c) => acc + c.pendingRequests, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-600">Manage your classes and student enrollments</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Class
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Classes", value: stats.total, icon: BookOpen, color: "blue" },
          { label: "Active Classes", value: stats.active, icon: CheckCircle, color: "green" },
          { label: "Total Students", value: stats.students, icon: Users, color: "purple" },
          { label: "Pending Requests", value: stats.pendingRequests, icon: AlertCircle, color: "orange" },
        ].map((stat, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center",
                    stat.color === "blue" && "bg-blue-100 text-blue-600",
                    stat.color === "green" && "bg-green-100 text-green-600",
                    stat.color === "purple" && "bg-purple-100 text-purple-600",
                    stat.color === "orange" && "bg-orange-100 text-orange-600"
                  )}><stat.icon className="w-5 h-5" /></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search classes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card><CardContent className="p-6"><SkeletonTable /></CardContent></Card>
      ) : filteredClasses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
            <p className="text-gray-500 mb-4">Create your first class to get started</p>
            <Button onClick={() => setShowCreateDialog(true)}><Plus className="w-4 h-4 mr-2" />Create Your First Class</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredClasses.map((cls, index) => (
              <motion.div key={cls.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.05 }}>
                <Card className={cn("hover:shadow-lg transition-all", cls.pendingRequests > 0 && "border-orange-200")}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{cls.name}</h3>
                          <Badge variant={cls.isActive ? "success" : "secondary"}>{cls.isActive ? "Active" : "Archived"}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">{cls.code}</Badge>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleCopyCode(cls.code)}><Copy className="h-3 w-3" /></Button>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Class</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit Class</DropdownMenuItem>
                          <DropdownMenuItem><Settings className="mr-2 h-4 w-4" />Settings</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Delete Class</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cls.description || "No description"}</p>

                    {cls.pendingRequests > 0 && (
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg mb-4 cursor-pointer hover:bg-orange-100 transition-colors" onClick={() => handleViewRequests(cls)}>
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-700">{cls.pendingRequests} pending request{cls.pendingRequests > 1 ? "s" : ""}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">Review</Button>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                      <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{cls._count.enrollments}</span></div>
                      <div className="flex items-center gap-1"><FileText className="w-4 h-4" /><span>{cls._count.assignments}</span></div>
                      <div className="flex items-center gap-1"><BookOpen className="w-4 h-4" /><span>{cls._count.materials}</span></div>
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>Sem {cls.semester}</span></div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Class Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>Create a class and share the code with your students</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Class Name *</Label><Input placeholder="e.g., Data Structures & Algorithms" value={newClass.name} onChange={(e) => setNewClass({ ...newClass, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Enter class description..." value={newClass.description} onChange={(e) => setNewClass({ ...newClass, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select value={newClass.department} onValueChange={(v) => setNewClass({ ...newClass, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Semester *</Label>
                <Select value={newClass.semester} onValueChange={(v) => setNewClass({ ...newClass, semester: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[1, 2, 3, 4, 5, 6, 7, 8].map(s => <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Subject *</Label><Input placeholder="e.g., Programming" value={newClass.subject} onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })} /></div>
            <div className="bg-blue-50 p-3 rounded-lg"><p className="text-sm text-blue-700"><strong>Note:</strong> A unique class code will be generated automatically. Share this code with your students to join.</p></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateClass} disabled={creating}>{creating ? "Creating..." : "Create Class"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Requests Dialog */}
      <Dialog open={showRequestsDialog} onOpenChange={setShowRequestsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Join Requests - {selectedClass?.name}</DialogTitle>
            <DialogDescription>Review and manage student enrollment requests</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {joinRequests.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No pending requests</p>
            ) : (
              joinRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.student.user.image} />
                      <AvatarFallback>{getInitials(request.student.user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.student.user.name}</p>
                      <p className="text-sm text-gray-500">{request.student.user.email}</p>
                      <p className="text-xs text-gray-400">{request.student.enrollmentNo} • {request.student.department} • Sem {request.student.semester}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleRequestAction(request.id, "reject")}><XCircle className="w-4 h-4 mr-1" />Reject</Button>
                    <Button size="sm" onClick={() => handleRequestAction(request.id, "approve")}><CheckCircle className="w-4 h-4 mr-1" />Approve</Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowRequestsDialog(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
