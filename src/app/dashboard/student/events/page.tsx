"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  CalendarDays,
  Ticket,
  Star,
  ExternalLink,
  Filter
} from "lucide-react"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  endTime: string
  location: string
  type: "workshop" | "seminar" | "cultural" | "sports" | "academic" | "career"
  organizer: string
  attendees: number
  maxAttendees: number
  isRegistered: boolean
  isFeatured: boolean
  image?: string
}

const eventTypeColors: Record<string, string> = {
  workshop: "bg-blue-100 text-blue-800",
  seminar: "bg-purple-100 text-purple-800",
  cultural: "bg-pink-100 text-pink-800",
  sports: "bg-green-100 text-green-800",
  academic: "bg-orange-100 text-orange-800",
  career: "bg-indigo-100 text-indigo-800",
}

export default function StudentEventsPage() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")

  useEffect(() => {
    setTimeout(() => {
      const today = new Date()
      setEvents([
        {
          id: "1",
          title: "AI in Education Workshop",
          description: "Learn how artificial intelligence is transforming the education sector with hands-on demonstrations and expert insights.",
          date: new Date(today.getTime() + 86400000 * 2).toISOString().split("T")[0],
          time: "10:00 AM",
          endTime: "01:00 PM",
          location: "Tech Building, Room 301",
          type: "workshop",
          organizer: "Computer Science Department",
          attendees: 45,
          maxAttendees: 60,
          isRegistered: true,
          isFeatured: true,
        },
        {
          id: "2",
          title: "Annual Cultural Fest 2025",
          description: "Join us for three days of music, dance, art, and cultural celebrations from around the world.",
          date: new Date(today.getTime() + 86400000 * 5).toISOString().split("T")[0],
          time: "05:00 PM",
          endTime: "10:00 PM",
          location: "Main Auditorium",
          type: "cultural",
          organizer: "Student Council",
          attendees: 320,
          maxAttendees: 500,
          isRegistered: false,
          isFeatured: true,
        },
        {
          id: "3",
          title: "Career Fair 2025",
          description: "Meet top employers and explore internship and job opportunities. Bring your resume!",
          date: new Date(today.getTime() + 86400000 * 7).toISOString().split("T")[0],
          time: "09:00 AM",
          endTime: "04:00 PM",
          location: "Convention Center",
          type: "career",
          organizer: "Career Services",
          attendees: 180,
          maxAttendees: 300,
          isRegistered: true,
          isFeatured: true,
        },
        {
          id: "4",
          title: "Research Methodology Seminar",
          description: "A comprehensive seminar on research methodologies for graduate students.",
          date: new Date(today.getTime() + 86400000 * 3).toISOString().split("T")[0],
          time: "02:00 PM",
          endTime: "05:00 PM",
          location: "Library Conference Room",
          type: "seminar",
          organizer: "Research Department",
          attendees: 28,
          maxAttendees: 40,
          isRegistered: false,
          isFeatured: false,
        },
        {
          id: "5",
          title: "Inter-College Basketball Tournament",
          description: "Watch the best college basketball teams compete for the championship trophy.",
          date: new Date(today.getTime() + 86400000 * 10).toISOString().split("T")[0],
          time: "03:00 PM",
          endTime: "08:00 PM",
          location: "Sports Complex",
          type: "sports",
          organizer: "Sports Committee",
          attendees: 150,
          maxAttendees: 500,
          isRegistered: false,
          isFeatured: false,
        },
        {
          id: "6",
          title: "Machine Learning Bootcamp",
          description: "Intensive 2-day bootcamp covering ML fundamentals, algorithms, and real-world applications.",
          date: new Date(today.getTime() + 86400000 * 14).toISOString().split("T")[0],
          time: "09:00 AM",
          endTime: "05:00 PM",
          location: "Computer Lab 201",
          type: "academic",
          organizer: "Data Science Club",
          attendees: 35,
          maxAttendees: 40,
          isRegistered: true,
          isFeatured: false,
        },
      ])
      setLoading(false)
    }, 800)
  }, [])

  const handleRegister = (eventId: string) => {
    setEvents(events.map(e => 
      e.id === eventId 
        ? { ...e, isRegistered: !e.isRegistered, attendees: e.isRegistered ? e.attendees - 1 : e.attendees + 1 }
        : e
    ))
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "all" || event.type === selectedType
    return matchesSearch && matchesType
  })

  const featuredEvents = filteredEvents.filter(e => e.isFeatured)
  const upcomingEvents = filteredEvents.filter(e => !e.isFeatured)
  const registeredEvents = events.filter(e => e.isRegistered)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className={`h-2 ${eventTypeColors[event.type].split(" ")[0]}`} />
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <Badge className={eventTypeColors[event.type]}>{event.type}</Badge>
          {event.isFeatured && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="w-3 h-3" /> Featured
            </Badge>
          )}
        </div>
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(event.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{event.time} - {event.endTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{event.attendees}/{event.maxAttendees} registered</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-xs text-gray-500">By {event.organizer}</span>
          <Button
            size="sm"
            variant={event.isRegistered ? "outline" : "default"}
            onClick={() => handleRegister(event.id)}
            disabled={!event.isRegistered && event.attendees >= event.maxAttendees}
          >
            {event.isRegistered ? "Registered ✓" : event.attendees >= event.maxAttendees ? "Full" : "Register"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <p className="text-gray-500 mt-1">Discover and register for campus events</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-xs text-gray-500">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Ticket className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{registeredEvents.length}</p>
                <p className="text-xs text-gray-500">Registered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{featuredEvents.length}</p>
                <p className="text-xs text-gray-500">Featured</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{events.filter(e => new Date(e.date) > new Date()).length}</p>
                <p className="text-xs text-gray-500">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "workshop", "seminar", "cultural", "sports", "academic", "career"].map(type => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="registered">My Registrations ({registeredEvents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {featuredEvents.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Featured Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {upcomingEvents.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <CalendarDays className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No events found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="registered">
          {registeredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Ticket className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No registrations yet</h3>
              <p className="text-gray-500">Browse events and register for ones that interest you</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
