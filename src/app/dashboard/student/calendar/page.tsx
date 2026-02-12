"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  BookOpen,
  FileText,
  AlertCircle,
  Users
} from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  type: "class" | "assignment" | "exam" | "event" | "meeting"
  description?: string
  location?: string
}

const eventTypeConfig = {
  class: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: BookOpen },
  assignment: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: FileText },
  exam: { color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle },
  event: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: Calendar },
  meeting: { color: "bg-green-100 text-green-800 border-green-200", icon: Users },
}

export default function StudentCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const today = new Date()
      setEvents([
        { id: "1", title: "Data Structures Class", date: today.toISOString().split("T")[0], time: "09:00 AM", type: "class", location: "Room 201" },
        { id: "2", title: "Assignment Due: Web Dev Project", date: today.toISOString().split("T")[0], time: "11:59 PM", type: "assignment" },
        { id: "3", title: "Database Systems", date: new Date(today.getTime() + 86400000).toISOString().split("T")[0], time: "10:30 AM", type: "class", location: "Room 305" },
        { id: "4", title: "Midterm Exam: Calculus", date: new Date(today.getTime() + 86400000 * 3).toISOString().split("T")[0], time: "02:00 PM", type: "exam", location: "Hall A" },
        { id: "5", title: "Study Group Meeting", date: new Date(today.getTime() + 86400000 * 2).toISOString().split("T")[0], time: "04:00 PM", type: "meeting", location: "Library" },
        { id: "6", title: "Tech Talk: AI in Education", date: new Date(today.getTime() + 86400000 * 5).toISOString().split("T")[0], time: "06:00 PM", type: "event", location: "Auditorium" },
        { id: "7", title: "Programming Lab", date: new Date(today.getTime() + 86400000 * 4).toISOString().split("T")[0], time: "11:00 AM", type: "class", location: "Lab 102" },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return events.filter(e => e.date === dateStr)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear()
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return day === selectedDate.getDate() && 
           currentDate.getMonth() === selectedDate.getMonth() && 
           currentDate.getFullYear() === selectedDate.getFullYear()
  }

  const hasEvents = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return getEventsForDate(date).length > 0
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-500 mt-1">View your schedule, deadlines, and upcoming events</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              {[...Array(firstDayOfMonth)].map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                const dayEvents = getEventsForDate(date)
                
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square p-1 rounded-lg transition-colors relative ${
                      isSelected(day)
                        ? "bg-blue-600 text-white"
                        : isToday(day)
                        ? "bg-blue-100 text-blue-900"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-sm font-medium">{day}</span>
                    {hasEvents(day) && !isSelected(day) && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((_, idx) => (
                          <div key={idx} className="w-1 h-1 rounded-full bg-blue-600" />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Events Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Select a Date"}
            </CardTitle>
            <CardDescription>
              {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? "s" : ""} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No events scheduled for this day</p>
              </div>
            ) : (
              selectedDateEvents.map((event) => {
                const config = eventTypeConfig[event.type]
                const IconComponent = config.icon
                return (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border ${config.color}`}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent className="w-4 h-4 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs opacity-80">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events This Week</CardTitle>
          <CardDescription>Your schedule for the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events
              .filter(e => new Date(e.date) >= new Date() && new Date(e.date) <= new Date(Date.now() + 7 * 86400000))
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((event) => {
                const config = eventTypeConfig[event.type]
                const IconComponent = config.icon
                return (
                  <div key={event.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{new Date(event.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                        <span>{event.time}</span>
                        {event.location && <span>{event.location}</span>}
                      </div>
                    </div>
                    <Badge variant="outline" className={config.color}>{event.type}</Badge>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
