"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  Search,
  Menu,
  X,
  Home,
  User,
  BookOpen,
  BarChart3,
  MessageSquare,
  Users,
  GraduationCap,
  Calendar,
  CheckSquare,
  ClipboardList,
  Library,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Megaphone,
  UserPlus
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { signOut } from "@/lib/auth-client"
import { cn, getInitials } from "@/lib/utils"

interface HeaderProps {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

const allNavigation = [
  { name: "Home", href: "/dashboard/teacher", icon: Home },
  { name: "Profile", href: "/dashboard/teacher/profile", icon: User },
  { name: "Classes", href: "/dashboard/teacher/classes", icon: BookOpen },
  { name: "Analytics", href: "/dashboard/teacher/analytics", icon: BarChart3 },
  { name: "Messages", href: "/dashboard/teacher/messages", icon: MessageSquare },
  { name: "Registrations", href: "/dashboard/teacher/registrations", icon: UserPlus },
  { name: "Students", href: "/dashboard/teacher/students", icon: Users },
  { name: "Calendar", href: "/dashboard/teacher/calendar", icon: Calendar },
  { name: "Attendance", href: "/dashboard/teacher/attendance", icon: CheckSquare },
  { name: "Announcements", href: "/dashboard/teacher/announcements", icon: Megaphone },
  { name: "Tasks", href: "/dashboard/teacher/tasks", icon: ClipboardList },
  { name: "Library", href: "/dashboard/teacher/library", icon: Library },
  { name: "Examinations", href: "/dashboard/teacher/examinations", icon: FileText },
  { name: "Settings", href: "/dashboard/teacher/settings", icon: Settings },
  { name: "Help", href: "/dashboard/teacher/help", icon: HelpCircle },
]

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut()
    window.location.href = "/"
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/80 backdrop-blur-lg px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden -m-2.5 p-2.5 text-gray-700"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search */}
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="relative flex flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search students, classes..."
              className="h-10 w-full max-w-md pl-10 bg-gray-50 border-0 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-x-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-gray-500" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  <DropdownMenuItem className="flex flex-col items-start p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="default" className="text-xs">New</Badge>
                      <span className="text-xs text-gray-500">1 hour ago</span>
                    </div>
                    <p className="text-sm font-medium">New Join Request</p>
                    <p className="text-xs text-gray-500">John Doe wants to join CS 101</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">3 hours ago</span>
                    </div>
                    <p className="text-sm font-medium">Assignment Submitted</p>
                    <p className="text-xs text-gray-500">15 students submitted Lab 5</p>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-purple-600 font-medium">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || undefined} alt={user.name} />
                    <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/teacher/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/teacher/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white lg:hidden overflow-y-auto"
            >
              <div className="flex h-16 items-center justify-between px-6 border-b">
                <Link href="/dashboard/teacher" className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold">EduConnect</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              {/* User Info */}
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image || undefined} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-4">
                <ul className="space-y-1">
                  {allNavigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg p-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              {/* Logout */}
              <div className="p-4 border-t mt-auto">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Log Out
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
