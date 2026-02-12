"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Mail, MessageSquare, Star, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils"

interface Tutor {
  id: string
  name: string
  email: string
  image?: string
  department: string
  subject: string
  rating: number
  classesCount: number
}

export default function TutorsPage() {
  const [loading, setLoading] = useState(true)
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await fetch("/api/student/classes")
        const data = await res.json()
        if (data.success) {
          const uniqueTutors = new Map()
          data.data.forEach((cls: any) => {
            if (cls.teacher && !uniqueTutors.has(cls.teacher.email)) {
              uniqueTutors.set(cls.teacher.email, {
                id: cls.teacher.email,
                name: cls.teacher.name,
                email: cls.teacher.email,
                image: cls.teacher.image,
                department: cls.department || "General",
                subject: cls.subject || "Various",
                rating: 4.5,
                classesCount: 1
              })
            } else if (cls.teacher) {
              const existing = uniqueTutors.get(cls.teacher.email)
              existing.classesCount++
            }
          })
          setTutors(Array.from(uniqueTutors.values()))
        }
      } catch (error) {
        console.error("Failed to load tutors")
      } finally {
        setLoading(false)
      }
    }
    fetchTutors()
  }, [])

  const filteredTutors = tutors.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tutors</h1>
        <p className="text-gray-600">Connect with your teachers and tutors</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search tutors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : filteredTutors.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tutors found</h3>
            <p className="text-gray-500">Join classes to connect with tutors</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutors.map((tutor, index) => (
            <motion.div key={tutor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Avatar className="w-20 h-20 mx-auto mb-4">
                      <AvatarImage src={tutor.image} />
                      <AvatarFallback className="bg-purple-100 text-purple-600 text-xl">
                        {getInitials(tutor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{tutor.name}</h3>
                    <p className="text-sm text-gray-500">{tutor.department}</p>
                    <Badge variant="outline" className="mt-2">{tutor.subject}</Badge>
                    <div className="flex items-center justify-center gap-1 mt-3">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{tutor.rating}</span>
                      <span className="text-gray-400">• {tutor.classesCount} class{tutor.classesCount > 1 ? 'es' : ''}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1" size="sm">
                      <Mail className="w-4 h-4 mr-1" /> Email
                    </Button>
                    <Button className="flex-1" size="sm">
                      <MessageSquare className="w-4 h-4 mr-1" /> Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
