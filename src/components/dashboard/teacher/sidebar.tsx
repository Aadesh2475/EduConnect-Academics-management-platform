"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  User,
  BookOpen,
  BarChart3,
  MessageSquare,
  Users,
  GraduationCap,
  Calendar,
  CheckSquare,
  Bell,
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

const mainNavigation = [
  { name: "Home", href: "/dashboard/teacher", icon: Home },
  { name: "Profile", href: "/dashboard/teacher/profile", icon: User },
  { name: "Sessions/Classes", href: "/dashboard/teacher/classes", icon: BookOpen },
  { name: "Analytics", href: "/dashboard/teacher/analytics", icon: BarChart3 },
  { name: "Messages", href: "/dashboard/teacher/messages", icon: MessageSquare },
]

const academicNavigation = [
  { name: "Registrations", href: "/dashboard/teacher/registrations", icon: UserPlus },
  { name: "Students", href: "/dashboard/teacher/students", icon: Users },
  { name: "Classes", href: "/dashboard/teacher/classes/manage", icon: GraduationCap },
  { name: "Calendar", href: "/dashboard/teacher/calendar", icon: Calendar },
  { name: "Attendance", href: "/dashboard/teacher/attendance", icon: CheckSquare },
  { name: "Announcements", href: "/dashboard/teacher/announcements", icon: Megaphone },
  { name: "Task Manager", href: "/dashboard/teacher/tasks", icon: ClipboardList },
  { name: "Library", href: "/dashboard/teacher/library", icon: Library },
  { name: "Examination", href: "/dashboard/teacher/examinations", icon: FileText },
]

const settingsNavigation = [
  { name: "Settings", href: "/dashboard/teacher/settings", icon: Settings },
  { name: "Help & Support", href: "/dashboard/teacher/help", icon: HelpCircle },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut()
    window.location.href = "/"
  }

  const NavSection = ({ title, items }: { title?: string; items: typeof mainNavigation }) => (
    <div className="space-y-1">
      {title && (
        <h3 className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
      )}
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "group flex gap-x-3 rounded-lg p-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
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
        )
      })}
    </div>
  )

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4 custom-scrollbar">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/dashboard/teacher" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EduConnect</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50">
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
        <nav className="flex flex-1 flex-col space-y-6">
          <NavSection title="Main Menu" items={mainNavigation} />
          <NavSection title="Academic Management" items={academicNavigation} />
          <NavSection items={settingsNavigation} />

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
  )
}
