"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  Search,
  Plus,
  Copy,
  Users,
  Calendar,
  Clock,
  FileText,
  MoreHorizontal,
  Eye,
  LogOut,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { SkeletonTable } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { getInitials, cn } from "@/lib/utils"
import Link from "next/link"

interface EnrolledClass {
  id: string
  name: string
  code: string
  description?: string
  subject: string
  department: string
  semester: number
  isActive: boolean
  teacher: {
    name: string
    email: string
    image?: string
  }
  enrollmentStatus: "APPROVED" | "PENDING" | "REJECTED"
  joinedAt?: string
  progress: number
  assignmentsDue: number
  _count: {
    enrollments: number
    assignments: number
    materials: number
    exams: number
  }
}

export default function StudentClassesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<EnrolledClass[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [joining, setJoining] = useState(false)
  const [activeTab, setActiveTab] = useState("enrolled")

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/student/classes")
      const result = await res.json()
      
      if (result.success) {
        setClasses(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load classes",
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
    fetchClasses()
  }, [])

  const handleJoinClass = async () => {
    if (!joinCode.trim()) {
      toast({ title: "Error", description: "Please enter a class code", variant: "destructive" })
      return
    }
    
    setJoining(true)
    try {
      const res = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.toUpperCase() }),
      })
      
      const result = await res.json()
      
      if (result.success) {
        toast({ 
          title: "Success", 
          description: result.message || "Join request sent! Waiting for approval." 
        })
        setShowJoinDialog(false)
        setJoinCode("")
        fetchClasses() // Refresh the list
      } else {
        toast({ 
          title: "Error", 
          description: result.error || "Failed to join class", 
          variant: "destructive" 
        })
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to send join request", 
        variant: "destructive" 
      })
    } finally {
      setJoining(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({ title: "Copied!", description: `Class code ${code} copied to clipboard` })
  }

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const enrolledClasses = filteredClasses.filter(c => c.enrollmentStatus === "APPROVED")
  const pendingClasses = filteredClasses.filter(c => c.enrollmentStatus === "PENDING")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-600">View and manage your enrolled classes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchClasses} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
          <Button onClick={() => setShowJoinDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Join Class
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Enrolled Classes", value: enrolledClasses.length, icon: BookOpen, color: "blue" },
          { label: "Pending Requests", value: pendingClasses.length, icon: Clock, color: "orange" },
          { label: "Assignments Due", value: classes.reduce((acc, c) => acc + (c.assignmentsDue || 0), 0), icon: FileText, color: "red" },
          { label: "Avg. Progress", value: `${enrolledClasses.length > 0 ? Math.round(enrolledClasses.reduce((acc, c) => acc + c.progress, 0) / enrolledClasses.length) : 0}%`, icon: CheckCircle, color: "green" },
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
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    stat.color === "blue" && "bg-blue-100 text-blue-600",
                    stat.color === "orange" && "bg-orange-100 text-orange-600",
                    stat.color === "red" && "bg-red-100 text-red-600",
                    stat.color === "green" && "bg-green-100 text-green-600",
                  )}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search classes by name, code, or teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Classes Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="enrolled" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Enrolled ({enrolledClasses.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingClasses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i}><CardContent className="p-6"><SkeletonTable /></CardContent></Card>
              ))}
            </div>
          ) : enrolledClasses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
                <p className="text-gray-500 mb-4">Join a class using the class code from your teacher</p>
                <Button onClick={() => setShowJoinDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Join Your First Class
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {enrolledClasses.map((cls, index) => (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/dashboard/student/classes/${cls.id}`}>
                      <Card className="hover:shadow-lg transition-all cursor-pointer group h-full">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {cls.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="font-mono text-xs">{cls.code}</Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCopyCode(cls.code) }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Class
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Message Teacher
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <LogOut className="mr-2 h-4 w-4" />
                                  Leave Class
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center gap-3 mb-4">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={cls.teacher.image} />
                              <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                                {getInitials(cls.teacher.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{cls.teacher.name}</p>
                              <p className="text-xs text-gray-500">{cls.subject}</p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Progress</span>
                              <span className="font-medium">{cls.progress}%</span>
                            </div>
                            <Progress value={cls.progress} className="h-2" />
                          </div>

                          {cls.assignmentsDue > 0 && (
                            <div className="flex items-center gap-2 text-sm p-2 bg-red-50 rounded-lg mb-4">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              <span className="text-red-700">{cls.assignmentsDue} assignment{cls.assignmentsDue > 1 ? 's' : ''} due</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{cls._count.enrollments}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              <span>{cls._count.assignments}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              <span>{cls._count.materials}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {pendingClasses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                <p className="text-gray-500">All your class join requests have been processed</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingClasses.map((cls, index) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-orange-200 bg-orange-50/50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                          Pending Approval
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{cls.name}</h3>
                      <Badge variant="outline" className="font-mono text-xs mb-4">{cls.code}</Badge>
                      
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={cls.teacher.image} />
                          <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                            {getInitials(cls.teacher.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{cls.teacher.name}</p>
                          <p className="text-xs text-gray-500">{cls.department}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Join Class Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join a Class</DialogTitle>
            <DialogDescription>
              Enter the class code provided by your teacher to request enrollment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="classCode">Class Code</Label>
              <Input
                id="classCode"
                placeholder="e.g., CS201"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="text-center text-lg font-mono tracking-wider"
              />
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Your enrollment will be pending until the teacher approves your request.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleJoinClass} disabled={joining}>
              {joining ? "Sending Request..." : "Join Class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
