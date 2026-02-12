"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Key,
  Mail,
  Save,
  Eye,
  EyeOff,
  Clock,
  BookOpen
} from "lucide-react"

export default function TeacherSettingsPage() {
  const { toast } = useToast()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    submissionAlerts: true,
    enrollmentAlerts: true,
    messageNotifications: true,
    reminderNotifications: true,
    
    // Teaching Preferences
    defaultGradingScale: "percentage",
    autoSaveInterval: "5",
    showStudentNames: true,
    allowLateSubmissions: true,
    
    // Appearance
    theme: "light",
    language: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
  })

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }
    if (passwords.new.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    })
    setPasswords({ current: "", new: "", confirm: "" })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and teaching preferences</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="teaching" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Teaching</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Delivery Methods</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-500">Receive push notifications on your device</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Notification Types</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Submission Alerts</p>
                    <p className="text-sm text-gray-500">Get notified when students submit assignments</p>
                  </div>
                  <Switch
                    checked={settings.submissionAlerts}
                    onCheckedChange={(checked) => setSettings({ ...settings, submissionAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enrollment Requests</p>
                    <p className="text-sm text-gray-500">Get notified about new enrollment requests</p>
                  </div>
                  <Switch
                    checked={settings.enrollmentAlerts}
                    onCheckedChange={(checked) => setSettings({ ...settings, enrollmentAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Message Notifications</p>
                    <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
                  </div>
                  <Switch
                    checked={settings.messageNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, messageNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Reminders</p>
                    <p className="text-sm text-gray-500">Get reminded about upcoming deadlines and events</p>
                  </div>
                  <Switch
                    checked={settings.reminderNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, reminderNotifications: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teaching Tab */}
        <TabsContent value="teaching">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Teaching Preferences
              </CardTitle>
              <CardDescription>
                Customize your teaching workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Default Grading Scale</Label>
                  <Select
                    value={settings.defaultGradingScale}
                    onValueChange={(value) => setSettings({ ...settings, defaultGradingScale: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select scale" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (0-100%)</SelectItem>
                      <SelectItem value="letter">Letter Grade (A-F)</SelectItem>
                      <SelectItem value="points">Points</SelectItem>
                      <SelectItem value="gpa">GPA (0-4.0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Auto-Save Interval</Label>
                  <Select
                    value={settings.autoSaveInterval}
                    onValueChange={(value) => setSettings({ ...settings, autoSaveInterval: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 minute</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="off">Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Student Names</p>
                    <p className="text-sm text-gray-500">Display student names when grading (blind grading if off)</p>
                  </div>
                  <Switch
                    checked={settings.showStudentNames}
                    onCheckedChange={(checked) => setSettings({ ...settings, showStudentNames: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Late Submissions</p>
                    <p className="text-sm text-gray-500">Accept submissions after the deadline by default</p>
                  </div>
                  <Switch
                    checked={settings.allowLateSubmissions}
                    onCheckedChange={(checked) => setSettings({ ...settings, allowLateSubmissions: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                Appearance Settings
              </CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value) => setSettings({ ...settings, theme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => setSettings({ ...settings, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                      <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                      <SelectItem value="IST">India Standard Time (IST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={settings.dateFormat}
                    onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-red-600" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleChangePassword}>
                <Key className="w-4 h-4 mr-2" />
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
