"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Library,
  Search,
  Upload,
  FileText,
  Video,
  Link,
  Download,
  Eye,
  Trash2,
  Plus,
  Folder,
  File,
  Image,
  BookOpen
} from "lucide-react"

interface Material {
  id: string
  name: string
  type: "document" | "video" | "link" | "image" | "presentation"
  className: string
  classCode: string
  size?: string
  url?: string
  uploadedAt: string
  downloads: number
}

const typeIcons = {
  document: FileText,
  video: Video,
  link: Link,
  image: Image,
  presentation: FileText,
}

const typeColors = {
  document: "bg-blue-100 text-blue-800",
  video: "bg-red-100 text-red-800",
  link: "bg-green-100 text-green-800",
  image: "bg-purple-100 text-purple-800",
  presentation: "bg-orange-100 text-orange-800",
}

export default function TeacherLibraryPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [materials, setMaterials] = useState<Material[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [classFilter, setClassFilter] = useState("all")
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    type: "document" as const,
    classCode: "",
    url: "",
  })

  useEffect(() => {
    setTimeout(() => {
      setMaterials([
        { id: "1", name: "Week 1 - Introduction to Data Structures.pdf", type: "document", className: "Data Structures", classCode: "CS201", size: "2.5 MB", uploadedAt: "2024-01-15", downloads: 42 },
        { id: "2", name: "Binary Tree Visualization", type: "link", className: "Data Structures", classCode: "CS201", url: "https://visualgo.net", uploadedAt: "2024-01-14", downloads: 38 },
        { id: "3", name: "Lecture 5 - Dynamic Programming.mp4", type: "video", className: "Algorithms", classCode: "CS301", size: "150 MB", uploadedAt: "2024-01-13", downloads: 55 },
        { id: "4", name: "React Components Slides.pptx", type: "presentation", className: "Web Development", classCode: "CS250", size: "8.2 MB", uploadedAt: "2024-01-12", downloads: 48 },
        { id: "5", name: "Database Schema Diagram.png", type: "image", className: "Database Systems", classCode: "CS302", size: "1.2 MB", uploadedAt: "2024-01-11", downloads: 21 },
        { id: "6", name: "Algorithm Complexity Cheat Sheet.pdf", type: "document", className: "Algorithms", classCode: "CS301", size: "500 KB", uploadedAt: "2024-01-10", downloads: 67 },
        { id: "7", name: "JavaScript Tutorial Series", type: "link", className: "Web Development", classCode: "CS250", url: "https://javascript.info", uploadedAt: "2024-01-09", downloads: 52 },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const handleUpload = () => {
    if (!newMaterial.name || !newMaterial.classCode) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const className = materials.find(m => m.classCode === newMaterial.classCode)?.className || "Unknown Class"
    
    const material: Material = {
      id: Date.now().toString(),
      name: newMaterial.name,
      type: newMaterial.type,
      className,
      classCode: newMaterial.classCode,
      url: newMaterial.url || undefined,
      size: newMaterial.type !== "link" ? "1.0 MB" : undefined,
      uploadedAt: new Date().toISOString().split("T")[0],
      downloads: 0,
    }

    setMaterials([material, ...materials])
    setNewMaterial({ name: "", type: "document", classCode: "", url: "" })
    setIsUploadOpen(false)
    toast({
      title: "Material uploaded",
      description: "Your material has been added to the library.",
    })
  }

  const handleDelete = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id))
    toast({
      title: "Material deleted",
      description: "The material has been removed from the library.",
    })
  }

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || material.type === typeFilter
    const matchesClass = classFilter === "all" || material.classCode === classFilter
    return matchesSearch && matchesType && matchesClass
  })

  const uniqueClasses = [...new Set(materials.map(m => ({ code: m.classCode, name: m.className })))]

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
          <h1 className="text-3xl font-bold text-gray-900">Library</h1>
          <p className="text-gray-500 mt-1">Manage your teaching materials</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Material</DialogTitle>
              <DialogDescription>Add a new material to your library</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  placeholder="Material name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newMaterial.type}
                    onValueChange={(value: any) => setNewMaterial({ ...newMaterial, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Class *</Label>
                  <Select
                    value={newMaterial.classCode}
                    onValueChange={(value) => setNewMaterial({ ...newMaterial, classCode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueClasses.map((cls, idx) => (
                        <SelectItem key={idx} value={cls.code}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {newMaterial.type === "link" && (
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    value={newMaterial.url}
                    onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              )}
              {newMaterial.type !== "link" && (
                <div className="space-y-2">
                  <Label>File</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, PPT, MP4, PNG (max 100MB)</p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
              <Button onClick={handleUpload}>Upload</Button>
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
                <Library className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{materials.length}</p>
                <p className="text-xs text-gray-500">Total Materials</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{materials.filter(m => m.type === "document").length}</p>
                <p className="text-xs text-gray-500">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <Video className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{materials.filter(m => m.type === "video").length}</p>
                <p className="text-xs text-gray-500">Videos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{materials.reduce((acc, m) => acc + m.downloads, 0)}</p>
                <p className="text-xs text-gray-500">Total Downloads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="link">Links</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="presentation">Presentations</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map((cls, idx) => (
                  <SelectItem key={idx} value={cls.code}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Materials List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Library className="w-5 h-5 text-purple-600" />
            Materials
          </CardTitle>
          <CardDescription>
            {filteredMaterials.length} material{filteredMaterials.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-12">
              <Library className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No materials found</h3>
              <p className="text-gray-500">Try adjusting your filters or upload new materials</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMaterials.map((material) => {
                const IconComponent = typeIcons[material.type]
                return (
                  <div
                    key={material.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50"
                  >
                    <div className={`p-3 rounded-lg ${typeColors[material.type]}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{material.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <Badge variant="outline">{material.classCode}</Badge>
                        {material.size && <span>{material.size}</span>}
                        <span>{new Date(material.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {material.downloads}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(material.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
