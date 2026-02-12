"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  BookOpen,
  Calendar,
  Edit2,
  Save,
  Camera,
  Award,
  Briefcase,
  GraduationCap
} from "lucide-react"

interface TeacherProfile {
  id: string
  name: string
  email: string
  phone: string
  image?: string
  department: string
  subject: string
  employeeId: string
  joinDate: string
  office: string
  bio: string
  qualifications: string[]
  experience: string
  specializations: string[]
}

export default function TeacherProfilePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [editedProfile, setEditedProfile] = useState<TeacherProfile | null>(null)

  useEffect(() => {
    setTimeout(() => {
      const data: TeacherProfile = {
        id: "1",
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@university.edu",
        phone: "+1 (555) 987-6543",
        image: "",
        department: "Computer Science",
        subject: "Data Structures & Algorithms",
        employeeId: "EMP-2019-0042",
        joinDate: "2019-08-15",
        office: "Tech Building, Room 305",
        bio: "Passionate educator with over 10 years of experience in computer science education. Focused on making complex concepts accessible to students.",
        qualifications: ["Ph.D. in Computer Science - MIT", "M.S. in Software Engineering - Stanford", "B.S. in Computer Science - UC Berkeley"],
        experience: "10+ years",
        specializations: ["Algorithms", "Data Structures", "Machine Learning", "Software Engineering"]
      }
      setProfile(data)
      setEditedProfile(data)
      setLoading(false)
    }, 800)
  }, [])

  const handleSave = () => {
    if (editedProfile) {
      setProfile(editedProfile)
      setEditing(false)
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      })
    }
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!profile || !editedProfile) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your personal information</p>
        </div>
        <Button
          variant={editing ? "default" : "outline"}
          onClick={() => editing ? handleSave() : setEditing(true)}
        >
          {editing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profile.image} alt={profile.name} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              {editing && (
                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full">
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-gray-500">{profile.subject}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                <Badge variant="secondary">{profile.department}</Badge>
                <Badge variant="outline">{profile.employeeId}</Badge>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="font-medium">{new Date(profile.joinDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Personal Information
              </CardTitle>
              <CardDescription>Your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    {editing ? (
                      <Input
                        id="name"
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      />
                    ) : (
                      <span className="text-gray-900">{profile.name}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {editing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      />
                    ) : (
                      <span className="text-gray-900">{profile.email}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {editing ? (
                      <Input
                        id="phone"
                        value={editedProfile.phone}
                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      />
                    ) : (
                      <span className="text-gray-900">{profile.phone}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="office">Office Location</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {editing ? (
                      <Input
                        id="office"
                        value={editedProfile.office}
                        onChange={(e) => setEditedProfile({ ...editedProfile, office: e.target.value })}
                      />
                    ) : (
                      <span className="text-gray-900">{profile.office}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {editing ? (
                  <Textarea
                    id="bio"
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700">{profile.bio}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                Professional Information
              </CardTitle>
              <CardDescription>Your work-related details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    {editing ? (
                      <Input
                        value={editedProfile.department}
                        onChange={(e) => setEditedProfile({ ...editedProfile, department: e.target.value })}
                      />
                    ) : (
                      <span className="text-gray-900">{profile.department}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    {editing ? (
                      <Input
                        value={editedProfile.subject}
                        onChange={(e) => setEditedProfile({ ...editedProfile, subject: e.target.value })}
                      />
                    ) : (
                      <span className="text-gray-900">{profile.subject}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{profile.employeeId}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Experience</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{profile.experience}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Specializations</Label>
                <div className="flex flex-wrap gap-2">
                  {profile.specializations.map((spec, index) => (
                    <Badge key={index} variant="secondary">{spec}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                Qualifications
              </CardTitle>
              <CardDescription>Your educational background and certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.qualifications.map((qual, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                    <div className="p-2 rounded-full bg-purple-100">
                      <Award className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{qual}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
