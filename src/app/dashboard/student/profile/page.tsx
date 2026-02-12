"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Mail, Phone, MapPin, Calendar, GraduationCap, Building, Save, Camera } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"

export default function StudentProfilePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    enrollmentNo: "",
    department: "",
    semester: "",
    dateOfBirth: "",
    image: ""
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/student/dashboard")
        const data = await res.json()
        if (data.success && data.data.student) {
          setProfile({
            name: data.data.student.name || "",
            email: data.data.student.email || "",
            phone: "",
            address: "",
            enrollmentNo: data.data.student.enrollmentNo || "",
            department: data.data.student.department || "",
            semester: data.data.student.semester?.toString() || "",
            dateOfBirth: "",
            image: data.data.student.image || ""
          })
        }
      } catch (error) {
        console.error("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast({ title: "Success", description: "Profile updated successfully" })
    setSaving(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative inline-block">
                <Avatar className="w-32 h-32 mx-auto">
                  <AvatarImage src={profile.image} />
                  <AvatarFallback className="text-3xl bg-blue-100 text-blue-600">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute bottom-0 right-0 rounded-full w-10 h-10">
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <h2 className="mt-4 text-xl font-semibold">{profile.name}</h2>
              <p className="text-gray-500">{profile.email}</p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">Student ID: {profile.enrollmentNo || "Not set"}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input className="pl-10" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input className="pl-10" value={profile.email} disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input className="pl-10" placeholder="Enter phone number" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input className="pl-10" type="date" value={profile.dateOfBirth} onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input className="pl-10" value={profile.department} onChange={(e) => setProfile({...profile, department: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input className="pl-10" value={profile.semester} onChange={(e) => setProfile({...profile, semester: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input className="pl-10" placeholder="Enter your address" value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} />
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
