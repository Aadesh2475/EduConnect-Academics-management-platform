import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-utils"
import { Sidebar } from "@/components/dashboard/admin/sidebar"
import { Header } from "@/components/dashboard/admin/header"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user is an admin
  if (session.role !== "ADMIN") {
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
