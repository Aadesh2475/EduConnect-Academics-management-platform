"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  Megaphone,
  Plus,
  Calendar,
  Users,
  Edit2,
  Trash2,
  Eye,
  Send,
  Clock,
  BookOpen,
  Pin
} from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  classes: string[]
  isGlobal: boolean
  isPinned: boolean
  createdAt: string
  views: number
}

export default function TeacherAnnouncementsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    classes: [] as string[],
    isGlobal: false,
    isPinned: false,
  })

  const availableClasses = [
    { code: "CS201", name: "Data Structures" },
    { code: "CS301", name: "Algorithms" },
    { code: "CS250", name: "Web Development" },
    { code: "CS302", name: "Database Systems" },
  ]

  useEffect(() => {
    setTimeout(() => {
      setAnnouncements([
        { id: "1", title: "Midterm Exam Schedule", content: "The midterm exam for Data Structures will be held on January 25th at 10:00 AM in Hall A. Please bring your student ID and a pen. Calculators are not allowed.", classes: ["CS201"], isGlobal: false, isPinned: true, createdAt: "2024-01-15T10:00:00", views: 42 },
        { id: "2", title: "Assignment Deadline Extended", content: "Due to multiple requests, the deadline for Assignment 3 has been extended to January 20th. Please submit your work through the online portal.", classes: ["CS201", "CS301"], isGlobal: false, isPinned: false, createdAt: "2024-01-14T14:30:00", views: 78 },
        { id: "3", title: "Office Hours Update", content: "My office hours for this week will be Tuesday 2-4 PM and Thursday 3-5 PM. Feel free to drop by or schedule an appointment.", classes: [], isGlobal: true, isPinned: false, createdAt: "2024-01-13T09:00:00", views: 156 },
        { id: "4", title: "Guest Lecture Tomorrow", content: "We have a special guest lecture from Dr. Smith from Google on 'AI in Practice'. Attendance is optional but highly recommended.", classes: ["CS250", "CS301"], isGlobal: false, isPinned: false, createdAt: "2024-01-12T16:00:00", views: 65 },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (!newAnnouncement.isGlobal && newAnnouncement.classes.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one class or make it a global announcement.",
        variant: "destructive",
      })
      return
    }

    const announcement: Announcement = {
      id: Date.now().toString(),
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      classes: newAnnouncement.classes,
      isGlobal: newAnnouncement.isGlobal,
      isPinned: newAnnouncement.isPinned,
      createdAt: new Date().toISOString(),
      views: 0,
    }

    setAnnouncements([announcement, ...announcements])
    setNewAnnouncement({ title: "", content: "", classes: [], isGlobal: false, isPinned: false })
    setIsCreateOpen(false)
    toast({
      title: "Announcement posted",
      description: "Your announcement has been published to the selected recipients.",
    })
  }

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter(a => a.id !== id))
    toast({
      title: "Announcement deleted",
      description: "The announcement has been removed.",
      variant: "destructive",
    })
  }

  const handleTogglePin = (id: string) => {
    setAnnouncements(announcements.map(a =>
      a.id === id ? { ...a, isPinned: !a.isPinned } : a
    ))
    const announcement = announcements.find(a => a.id === id)
    toast({
      title: announcement?.isPinned ? "Unpinned" : "Pinned",
      description: `Announcement has been ${announcement?.isPinned ? "unpinned" : "pinned"}.`,
    })
  }

  const toggleClass = (classCode: string) => {
    if (newAnnouncement.classes.includes(classCode)) {
      setNewAnnouncement({
        ...newAnnouncement,
        classes: newAnnouncement.classes.filter(c => c !== classCode),
      })
    } else {
      setNewAnnouncement({
        ...newAnnouncement,
        classes: [...newAnnouncement.classes, classCode],
      })
    }
  }

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 mt-1">Create and manage class announcements</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
              <DialogDescription>
                Post a new announcement to your classes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="Announcement title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  placeholder="Write your announcement here..."
                  rows={5}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Recipients</Label>
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="global"
                    checked={newAnnouncement.isGlobal}
                    onCheckedChange={(checked) => setNewAnnouncement({
                      ...newAnnouncement,
                      isGlobal: checked as boolean,
                      classes: checked ? [] : newAnnouncement.classes,
                    })}
                  />
                  <label htmlFor="global" className="text-sm font-medium">
                    Send to all students (Global)
                  </label>
                </div>
                {!newAnnouncement.isGlobal && (
                  <div className="grid grid-cols-2 gap-2">
                    {availableClasses.map((cls) => (
                      <div key={cls.code} className="flex items-center space-x-2">
                        <Checkbox
                          id={cls.code}
                          checked={newAnnouncement.classes.includes(cls.code)}
                          onCheckedChange={() => toggleClass(cls.code)}
                        />
                        <label htmlFor={cls.code} className="text-sm">
                          {cls.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pinned"
                  checked={newAnnouncement.isPinned}
                  onCheckedChange={(checked) => setNewAnnouncement({
                    ...newAnnouncement,
                    isPinned: checked as boolean,
                  })}
                />
                <label htmlFor="pinned" className="text-sm font-medium">
                  Pin this announcement
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateAnnouncement}>
                <Send className="w-4 h-4 mr-2" />
                Post Announcement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100">
                <Megaphone className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700">{announcements.length}</p>
                <p className="text-sm text-purple-600">Total Announcements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {announcements.reduce((acc, a) => acc + a.views, 0)}
                </p>
                <p className="text-sm text-blue-600">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Pin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {announcements.filter(a => a.isPinned).length}
                </p>
                <p className="text-sm text-green-600">Pinned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-600" />
            All Announcements
          </CardTitle>
          <CardDescription>
            Manage your class announcements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No announcements yet</h3>
              <p className="text-gray-500">Create your first announcement to get started</p>
            </div>
          ) : (
            sortedAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-4 rounded-lg border ${announcement.isPinned ? "bg-yellow-50 border-yellow-200" : "hover:bg-gray-50"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {announcement.isPinned && (
                        <Pin className="w-4 h-4 text-yellow-600" />
                      )}
                      <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{announcement.content}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(announcement.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {announcement.views} views
                      </span>
                      {announcement.isGlobal ? (
                        <Badge variant="secondary">Global</Badge>
                      ) : (
                        announcement.classes.map(c => (
                          <Badge key={c} variant="outline">{c}</Badge>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePin(announcement.id)}
                      title={announcement.isPinned ? "Unpin" : "Pin"}
                    >
                      <Pin className={`w-4 h-4 ${announcement.isPinned ? "text-yellow-600" : ""}`} />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedAnnouncement(announcement)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{selectedAnnouncement?.title || announcement.title}</DialogTitle>
                          <DialogDescription>
                            Posted on {new Date(announcement.createdAt).toLocaleDateString("en-US", {
                              weekday: "long", month: "long", day: "numeric", year: "numeric"
                            })}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                          <div className="flex gap-2 mt-4">
                            {announcement.isGlobal ? (
                              <Badge>Global Announcement</Badge>
                            ) : (
                              announcement.classes.map(c => (
                                <Badge key={c} variant="outline">{c}</Badge>
                              ))
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
