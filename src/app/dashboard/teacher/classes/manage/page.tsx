"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
  GraduationCap,
  Plus,
  Settings,
  Users,
  FileText,
  BookOpen,
  Calendar,
  Edit2,
  Trash2,
  Copy,
  Archive,
  MoreVertical
} from "lucide-react"

interface ClassData {
  id: string
  name: string
  code: string
  description: string
  department: string
  semester: string
  subject: string
  isActive: boolean
  students: number
  assignments: number
  materials: number
  createdAt: string
}

export default function TeacherClassesManagePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<ClassData[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [newClass, setNewClass] = useState({
    name: "",
    description: "",
    department: "",
    semester: "",
    subject: "",
  })

  useEffect(() => {
    setTimeout(() => {
      setClasses([
        { id: "1", name: "Data Structures", code: "CS201-A1B2", description: "Introduction to data structures and algorithms", department: "Computer Science", semester: "Fall 2024", subject: "Computer Science", isActive: true, students: 45, assignments: 12, materials: 24, createdAt: "2024-08-01" },
        { id: "2", name: "Algorithms", code: "CS301-C3D4", description: "Advanced algorithm design and analysis", department: "Computer Science", semester: "Fall 2024", subject: "Computer Science", isActive: true, students: 38, assignments: 10, materials: 18, createdAt: "2024-08-01" },
        { id: "3", name: "Web Development", code: "CS250-E5F6", description: "Full-stack web development with modern frameworks", department: "Computer Science", semester: "Fall 2024", subject: "Web Technologies", isActive: true, students: 52, assignments: 15, materials: 30, createdAt: "2024-08-05" },
        { id: "4", name: "Database Systems", code: "CS302-G7H8", description: "Relational and NoSQL database design", department: "Computer Science", semester: "Fall 2024", subject: "Database", isActive: false, students: 21, assignments: 8, materials: 15, createdAt: "2024-07-15" },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const handleCreateClass = () => {
    if (!newClass.name || !newClass.department || !newClass.semester) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const classCode = `${newClass.department.substring(0, 2).toUpperCase()}${newClass.semester.charAt(0)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    
    const createdClass: ClassData = {
      id: Date.now().toString(),
      name: newClass.name,
      code: classCode,
      description: newClass.description,
      department: newClass.department,
      semester: newClass.semester,
      subject: newClass.subject,
      isActive: true,
      students: 0,
      assignments: 0,
      materials: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setClasses([createdClass, ...classes])
    setNewClass({ name: "", description: "", department: "", semester: "", subject: "" })
    setIsCreateOpen(false)
    toast({
      title: "Class created",
      description: `${newClass.name} has been created with code ${classCode}`,
    })
  }

  const handleToggleActive = (id: string) => {
    setClasses(classes.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ))
    const cls = classes.find(c => c.id === id)
    toast({
      title: cls?.isActive ? "Class archived" : "Class activated",
      description: `${cls?.name} has been ${cls?.isActive ? "archived" : "activated"}.`,
    })
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Copied!",
      description: "Class code copied to clipboard.",
    })
  }

  const handleDeleteClass = (id: string) => {
    setClasses(classes.filter(c => c.id !== id))
    toast({
      title: "Class deleted",
      description: "The class has been permanently deleted.",
      variant: "destructive",
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Classes</h1>
          <p className="text-gray-500 mt-1">Create, edit, and manage your classes</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new class
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name *</Label>
                <Input
                  id="name"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  placeholder="e.g., Data Structures"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={newClass.department}
                    onValueChange={(value) => setNewClass({ ...newClass, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester *</Label>
                  <Select
                    value={newClass.semester}
                    onValueChange={(value) => setNewClass({ ...newClass, semester: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                      <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                      <SelectItem value="Summer 2025">Summer 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newClass.subject}
                  onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                  placeholder="e.g., Programming"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newClass.description}
                  onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                  placeholder="Brief description of the class..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateClass}>Create Class</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{classes.length}</p>
                <p className="text-xs text-gray-500">Total Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <GraduationCap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{classes.filter(c => c.isActive).length}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{classes.reduce((acc, c) => acc + c.students, 0)}</p>
                <p className="text-xs text-gray-500">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{classes.reduce((acc, c) => acc + c.assignments, 0)}</p>
                <p className="text-xs text-gray-500">Assignments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes List */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active ({classes.filter(c => c.isActive).length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({classes.filter(c => !c.isActive).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.filter(c => c.isActive).map((cls) => (
              <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{cls.code}</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyCode(cls.code)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </CardDescription>
                    </div>
                    <Badge variant={cls.isActive ? "default" : "secondary"}>
                      {cls.isActive ? "Active" : "Archived"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{cls.description}</p>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-2 rounded-lg bg-gray-50">
                      <p className="text-lg font-bold">{cls.students}</p>
                      <p className="text-xs text-gray-500">Students</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50">
                      <p className="text-lg font-bold">{cls.assignments}</p>
                      <p className="text-xs text-gray-500">Assignments</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50">
                      <p className="text-lg font-bold">{cls.materials}</p>
                      <p className="text-xs text-gray-500">Materials</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {cls.semester}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-1" />
                        Settings
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(cls.id)}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="archived">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.filter(c => !c.isActive).map((cls) => (
              <Card key={cls.id} className="opacity-75 hover:opacity-100 transition-opacity">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-gray-600">{cls.name}</CardTitle>
                      <CardDescription>{cls.code}</CardDescription>
                    </div>
                    <Badge variant="secondary">Archived</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-2 rounded-lg bg-gray-50">
                      <p className="text-lg font-bold text-gray-500">{cls.students}</p>
                      <p className="text-xs text-gray-400">Students</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50">
                      <p className="text-lg font-bold text-gray-500">{cls.assignments}</p>
                      <p className="text-xs text-gray-400">Assignments</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50">
                      <p className="text-lg font-bold text-gray-500">{cls.materials}</p>
                      <p className="text-xs text-gray-400">Materials</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-gray-500">{cls.semester}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(cls.id)}
                      >
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClass(cls.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {classes.filter(c => !c.isActive).length === 0 && (
              <div className="col-span-2 text-center py-12">
                <Archive className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No archived classes</h3>
                <p className="text-gray-500">Classes you archive will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
