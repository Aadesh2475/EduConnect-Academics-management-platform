import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-utils"
import { Sidebar } from "@/components/dashboard/student/sidebar"
import { Header } from "@/components/dashboard/student/header"

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user is a student
  if (session.role !== "STUDENT") {
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
