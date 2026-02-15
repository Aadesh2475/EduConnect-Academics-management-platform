import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminSidebar } from "@/components/dashboard/admin/sidebar"
import { AdminHeader } from "@/components/dashboard/admin/header"

async function getUser() {
  const cookieStore = await cookies()
  const userInfoCookie = cookieStore.get("user_info")?.value
  const sessionToken = cookieStore.get("session_token")?.value

  if (!sessionToken) {
    return null
  }

  if (userInfoCookie) {
    try {
      return JSON.parse(userInfoCookie)
    } catch {
      return null
    }
  }

  return null
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  if (user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar user={user} />
      <div className="lg:pl-72">
        <AdminHeader user={user} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
