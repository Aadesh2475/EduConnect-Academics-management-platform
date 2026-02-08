"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  Activity,
  FileText,
  Bell,
  Database,
  Cog
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth-client"
import { cn, getInitials } from "@/lib/utils"

interface AdminSidebarProps {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

const navigation = [
  { name: "Dashboard", href: "/dashboard/admin", icon: Home },
  { name: "Students", href: "/dashboard/admin/students", icon: GraduationCap },
  { name: "Teachers", href: "/dashboard/admin/teachers", icon: Users },
  { name: "Classes", href: "/dashboard/admin/classes", icon: BookOpen },
  { name: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
  { name: "Reports", href: "/dashboard/admin/reports", icon: FileText },
  { name: "Activity Logs", href: "/dashboard/admin/logs", icon: Activity },
  { name: "Notifications", href: "/dashboard/admin/notifications", icon: Bell },
  { name: "Database", href: "/dashboard/admin/database", icon: Database },
  { name: "System Settings", href: "/dashboard/admin/settings", icon: Cog },
]

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut()
    window.location.href = "/"
  }

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-gray-900 px-6 pb-4">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/dashboard/admin" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-800">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback className="bg-red-600">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
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
                        ? "bg-gradient-to-r from-red-600 to-orange-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Logout Button */}
          <div className="mt-auto pt-4 border-t border-gray-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
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
