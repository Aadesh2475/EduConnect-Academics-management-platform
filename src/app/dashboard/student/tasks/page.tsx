"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Check, Trash2, Clock, Calendar, CheckCircle2, Circle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface Task {
  id: string
  title: string
  completed: boolean
  priority: "high" | "medium" | "low"
  dueDate?: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Complete Data Structures assignment", completed: false, priority: "high", dueDate: "2024-02-15" },
    { id: "2", title: "Review lecture notes for Math", completed: true, priority: "medium" },
    { id: "3", title: "Submit lab report", completed: false, priority: "high", dueDate: "2024-02-14" },
    { id: "4", title: "Practice coding problems", completed: false, priority: "low" },
  ])
  const [newTask, setNewTask] = useState("")

  const addTask = () => {
    if (!newTask.trim()) return
    setTasks([...tasks, { id: Date.now().toString(), title: newTask, completed: false, priority: "medium" }])
    setNewTask("")
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700"
      case "medium": return "bg-yellow-100 text-yellow-700"
      case "low": return "bg-green-100 text-green-700"
    }
  }

  const completedCount = tasks.filter(t => t.completed).length
  const pendingCount = tasks.filter(t => !t.completed).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Task Lists</h1>
        <p className="text-gray-600">Manage your daily tasks and to-dos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Circle className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input placeholder="Add a new task..." value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyPress={(e) => e.key === "Enter" && addTask()} />
            <Button onClick={addTask}><Plus className="w-4 h-4 mr-1" /> Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No tasks yet. Add one above!</p>
            ) : (
              tasks.map((task, index) => (
                <motion.div key={task.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className={`flex items-center gap-4 p-4 rounded-lg border ${task.completed ? 'bg-gray-50' : 'bg-white'}`}>
                  <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} />
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</p>
                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
