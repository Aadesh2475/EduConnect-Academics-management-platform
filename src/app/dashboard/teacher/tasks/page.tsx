"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  ClipboardList,
  Plus,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Trash2,
  Edit2,
  Flag,
  Filter
} from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  priority: "low" | "medium" | "high"
  category: "grading" | "preparation" | "meeting" | "administrative" | "other"
  isCompleted: boolean
  createdAt: string
}

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
}

const categoryColors = {
  grading: "bg-blue-100 text-blue-800",
  preparation: "bg-purple-100 text-purple-800",
  meeting: "bg-orange-100 text-orange-800",
  administrative: "bg-gray-100 text-gray-800",
  other: "bg-cyan-100 text-cyan-800",
}

export default function TeacherTasksPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [filter, setFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as const,
    category: "other" as const,
  })

  useEffect(() => {
    setTimeout(() => {
      const today = new Date()
      setTasks([
        { id: "1", title: "Grade CS201 Assignment 3", description: "Review and grade 45 student submissions", dueDate: new Date(today.getTime() + 86400000 * 2).toISOString().split("T")[0], priority: "high", category: "grading", isCompleted: false, createdAt: "2024-01-15" },
        { id: "2", title: "Prepare lecture slides for Week 5", description: "Topics: Binary Search Trees, AVL Trees", dueDate: new Date(today.getTime() + 86400000 * 4).toISOString().split("T")[0], priority: "medium", category: "preparation", isCompleted: false, createdAt: "2024-01-14" },
        { id: "3", title: "Department meeting", description: "Monthly faculty meeting in Room 301", dueDate: new Date(today.getTime() + 86400000).toISOString().split("T")[0], priority: "medium", category: "meeting", isCompleted: false, createdAt: "2024-01-13" },
        { id: "4", title: "Submit grades for Fall semester", dueDate: new Date(today.getTime() + 86400000 * 7).toISOString().split("T")[0], priority: "high", category: "administrative", isCompleted: false, createdAt: "2024-01-12" },
        { id: "5", title: "Review CS301 exam questions", description: "Finalize midterm exam", dueDate: new Date(today.getTime() + 86400000 * 5).toISOString().split("T")[0], priority: "high", category: "preparation", isCompleted: true, createdAt: "2024-01-10" },
        { id: "6", title: "Update course syllabus", priority: "low", category: "administrative", isCompleted: true, createdAt: "2024-01-08" },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const handleCreateTask = () => {
    if (!newTask.title) {
      toast({
        title: "Error",
        description: "Please enter a task title.",
        variant: "destructive",
      })
      return
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate || undefined,
      priority: newTask.priority,
      category: newTask.category,
      isCompleted: false,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setTasks([task, ...tasks])
    setNewTask({ title: "", description: "", dueDate: "", priority: "medium", category: "other" })
    setIsCreateOpen(false)
    toast({
      title: "Task created",
      description: "Your task has been added to the list.",
    })
  }

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
    toast({
      title: "Task deleted",
      description: "The task has been removed.",
    })
  }

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filter === "all" || 
      (filter === "completed" && task.isCompleted) ||
      (filter === "pending" && !task.isCompleted)
    const matchesCategory = categoryFilter === "all" || task.category === categoryFilter
    return matchesStatus && matchesCategory
  })

  const pendingTasks = tasks.filter(t => !t.isCompleted)
  const completedTasks = tasks.filter(t => t.isCompleted)
  const overdueTasks = pendingTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date())

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
          <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
          <p className="text-gray-500 mt-1">Organize and track your teaching tasks</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>Add a new task to your list</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newTask.category}
                  onValueChange={(value: any) => setNewTask({ ...newTask, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grading">Grading</SelectItem>
                    <SelectItem value="preparation">Preparation</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTask}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tasks.length}</p>
                <p className="text-xs text-gray-500">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingTasks.length}</p>
                <p className="text-xs text-gray-500">Pending</p>
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
                <p className="text-2xl font-bold">{completedTasks.length}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <Flag className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overdueTasks.length}</p>
                <p className="text-xs text-gray-500">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="grading">Grading</SelectItem>
                <SelectItem value="preparation">Preparation</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="administrative">Administrative</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-purple-600" />
            Tasks
          </CardTitle>
          <CardDescription>
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
              <p className="text-gray-500">Try adjusting your filters or add a new task</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isOverdue = task.dueDate && !task.isCompleted && new Date(task.dueDate) < new Date()
              return (
                <div
                  key={task.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${
                    task.isCompleted ? "bg-gray-50 opacity-75" : isOverdue ? "bg-red-50 border-red-200" : "hover:bg-gray-50"
                  }`}
                >
                  <Checkbox
                    checked={task.isCompleted}
                    onCheckedChange={() => toggleComplete(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${task.isCompleted ? "line-through text-gray-500" : "text-gray-900"}`}>
                        {task.title}
                      </h3>
                      {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                      <Badge className={categoryColors[task.category]}>{task.category}</Badge>
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
