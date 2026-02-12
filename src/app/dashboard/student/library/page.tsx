"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Download, FileText, Video, Book, File, Eye, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Material {
  id: string
  title: string
  description: string
  type: "PDF" | "VIDEO" | "DOCUMENT" | "OTHER"
  className: string
  classCode: string
  uploadedAt: string
  size?: string
}

export default function LibraryPage() {
  const [loading, setLoading] = useState(true)
  const [materials, setMaterials] = useState<Material[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchMaterials = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMaterials([
        { id: "1", title: "Data Structures Notes", description: "Comprehensive notes on arrays, linked lists, and trees", type: "PDF", className: "Data Structures", classCode: "CS201", uploadedAt: new Date().toISOString(), size: "2.5 MB" },
        { id: "2", title: "Introduction to Algorithms", description: "Video lecture on sorting algorithms", type: "VIDEO", className: "Data Structures", classCode: "CS201", uploadedAt: new Date().toISOString(), size: "150 MB" },
        { id: "3", title: "Database Design Guide", description: "Step-by-step guide for database normalization", type: "DOCUMENT", className: "Database Systems", classCode: "CS301", uploadedAt: new Date().toISOString(), size: "1.2 MB" },
      ])
      setLoading(false)
    }
    fetchMaterials()
  }, [])

  const getTypeIcon = (type: Material["type"]) => {
    switch (type) {
      case "PDF": return <FileText className="w-5 h-5 text-red-500" />
      case "VIDEO": return <Video className="w-5 h-5 text-blue-500" />
      case "DOCUMENT": return <Book className="w-5 h-5 text-green-500" />
      default: return <File className="w-5 h-5 text-gray-500" />
    }
  }

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || m.type === activeTab
    return matchesSearch && matchesTab
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Library</h1>
        <p className="text-gray-600">Access course materials and resources</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search materials..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="PDF">PDFs</TabsTrigger>
          <TabsTrigger value="VIDEO">Videos</TabsTrigger>
          <TabsTrigger value="DOCUMENT">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : filteredMaterials.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Book className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No materials found</h3>
                <p className="text-gray-500">Materials will appear here when your teachers upload them</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((material, index) => (
                <motion.div key={material.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          {getTypeIcon(material.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{material.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{material.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{material.classCode}</Badge>
                            {material.size && <span className="text-xs text-gray-400">{material.size}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        <Button size="sm" className="flex-1">
                          <Download className="w-4 h-4 mr-1" /> Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
