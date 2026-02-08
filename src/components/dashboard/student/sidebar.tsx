"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Home,
  User,
  BookOpen,
  Users,
  FileText,
  HelpCircle,
  Calendar,
  CalendarDays,
  MessageSquare,
  CheckSquare,
  ClipboardList,
  GraduationCap,
  Settings,
  HelpCircleIcon,
  LogOut,
  Library,
  BarChart3,
  Bell
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth-client"
import { cn, getInitials } from "@/lib/utils"

interface SidebarProps {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

const navigation = [
  { name: "Home", href: "/dashboard/student", icon: Home },
  { name: "Profile", href: "/dashboard/student/profile", icon: User },
  { name: "Enrolled Classes", href: "/dashboard/student/classes", icon: BookOpen },
  { name: "Tutors", href: "/dashboard/student/tutors", icon: Users },
  { name: "Assignments", href: "/dashboard/student/assignments", icon: FileText },
  { name: "Quiz", href: "/dashboard/student/quiz", icon: HelpCircle },
  { name: "Library", href: "/dashboard/student/library", icon: Library },
  { name: "Attendance", href: "/dashboard/student/attendance", icon: CheckSquare },
  { name: "Messages", href: "/dashboard/student/messages", icon: MessageSquare },
  { name: "Task Lists", href: "/dashboard/student/tasks", icon: ClipboardList },
  { name: "Results", href: "/dashboard/student/results", icon: BarChart3 },
  { name: "Academic Details", href: "/dashboard/student/academics", icon: GraduationCap },
  { name: "Calendar", href: "/dashboard/student/calendar", icon: Calendar },
  { name: "Events", href: "/dashboard/student/events", icon: CalendarDays },
  { name: "Settings", href: "/dashboard/student/settings", icon: Settings },
  { name: "Help & Support", href: "/dashboard/student/help", icon: HelpCircleIcon },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut()
    window.location.href = "/"
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/dashboard/student" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EduConnect</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.image || undefined} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex gap-x-3 rounded-lg p-2 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0",
                          isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                        )}
                      />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Logout Button */}
            <div className="mt-auto pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Log Out
              </Button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar - could add hamburger menu logic here */}
    </>
  )
}
