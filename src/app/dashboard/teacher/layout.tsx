import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Sidebar } from "@/components/dashboard/teacher/sidebar"
import { Header } from "@/components/dashboard/teacher/header"

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

export default async function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is a teacher
  if (user.role !== "TEACHER") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <div className="lg:pl-72">
        <Header user={user} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
