import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"

async function getSessionAndRole() {
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
      select: { role: true }
    })

    return {
      ...session,
      role: dbUser?.role || "STUDENT"
    }
  } catch (error) {
    console.error("Session error:", error)
    return null
  }
}

export default async function DashboardRedirect() {
  const sessionData = await getSessionAndRole()

  if (!sessionData?.user) {
    redirect("/auth/login")
  }

  // Redirect based on role
  const role = sessionData.role
  
  switch (role) {
    case "ADMIN":
      redirect("/dashboard/admin")
    case "TEACHER":
      redirect("/dashboard/teacher")
    case "STUDENT":
    default:
      redirect("/dashboard/student")
  }
}
