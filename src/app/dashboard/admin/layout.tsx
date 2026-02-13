import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { AdminSidebar } from "@/components/dashboard/admin/sidebar"
import { AdminHeader } from "@/components/dashboard/admin/header"

async function getSessionWithRole() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return null
    }

    // Get role from database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, name: true, email: true, image: true }
    })

    return {
      user: {
        id: session.user.id,
        name: dbUser?.name || session.user.name || "",
        email: dbUser?.email || session.user.email || "",
        image: dbUser?.image || session.user.image,
        role: dbUser?.role || "STUDENT"
      }
    }
  } catch (error) {
    console.error("Session error:", error)
    return null
  }
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sessionData = await getSessionWithRole()

  if (!sessionData?.user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  if (sessionData.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar user={sessionData.user} />
      <div className="lg:pl-72">
        <AdminHeader user={sessionData.user} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
