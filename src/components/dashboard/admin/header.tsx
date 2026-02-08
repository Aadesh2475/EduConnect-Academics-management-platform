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
  Users,
  GraduationCap,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  Activity,
  FileText,
  Database,
  Cog
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

interface AdminHeaderProps {
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
  { name: "Settings", href: "/dashboard/admin/settings", icon: Cog },
]

export function AdminHeader({ user }: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut()
    window.location.href = "/"
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/80 backdrop-blur-lg px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="lg:hidden -m-2.5 p-2.5 text-gray-700"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="relative flex flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search users, classes..."
              className="h-10 w-full max-w-md pl-10 bg-gray-50 border-0 focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center gap-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-gray-500" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>System Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  <DropdownMenuItem className="flex flex-col items-start p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive" className="text-xs">Alert</Badge>
                      <span className="text-xs text-gray-500">30 min ago</span>
                    </div>
                    <p className="text-sm font-medium">High Server Load</p>
                    <p className="text-xs text-gray-500">CPU usage at 85%</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="default" className="text-xs">Info</Badge>
                      <span className="text-xs text-gray-500">1 hour ago</span>
                    </div>
                    <p className="text-sm font-medium">New User Registration</p>
                    <p className="text-xs text-gray-500">15 new students today</p>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-red-600 font-medium">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || undefined} alt={user.name} />
                    <AvatarFallback className="text-xs bg-red-600 text-white">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    Admin
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
                  <Link href="/dashboard/admin/settings">
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
              className="fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 lg:hidden overflow-y-auto"
            >
              <div className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
                <Link href="/dashboard/admin" className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-white">Admin Panel</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-800">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image || undefined} alt={user.name} />
                    <AvatarFallback className="bg-red-600">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              <nav className="p-4">
                <ul className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg p-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-gradient-to-r from-red-600 to-orange-600 text-white"
                              : "text-gray-300 hover:bg-gray-800"
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

              <div className="p-4 border-t border-gray-800 mt-auto">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
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
