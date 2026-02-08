import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Sidebar } from "@/components/dashboard/teacher/sidebar"
import { Header } from "@/components/dashboard/teacher/header"

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  })
}

export default async function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session?.user) {
    redirect("/auth/login")
  }

  // Check if user is a teacher
  // @ts-ignore - role is added to user
  if (session.user.role !== "TEACHER") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={session.user} />
      <div className="lg:pl-72">
        <Header user={session.user} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
