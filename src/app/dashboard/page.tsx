import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-utils"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Redirect based on user role
  switch (session.role) {
    case "ADMIN":
      redirect("/dashboard/admin")
    case "TEACHER":
      redirect("/dashboard/teacher")
    case "STUDENT":
    default:
      redirect("/dashboard/student")
  }
}
