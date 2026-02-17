import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-utils"
import { Sidebar } from "@/components/dashboard/teacher/sidebar"
import { Header } from "@/components/dashboard/teacher/header"

export default async function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user is a teacher
  if (session.role !== "TEACHER") {
    redirect("/dashboard")
  }

  const user = {
    id: session.id,
    name: session.name,
    email: session.email,
    image: session.image,
    role: session.role,
    theme: session.theme,
  }

  return (
    <div className={`min-h-screen ${session.theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"}`}>
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
