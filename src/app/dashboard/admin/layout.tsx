import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { AdminSidebar } from "@/components/dashboard/admin/sidebar"
import { AdminHeader } from "@/components/dashboard/admin/header"

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  })
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session?.user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  // @ts-ignore - role is added to user
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar user={session.user} />
      <div className="lg:pl-72">
        <AdminHeader user={session.user} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
