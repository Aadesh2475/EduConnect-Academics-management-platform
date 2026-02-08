import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  })
}

export default async function DashboardRedirect() {
  const session = await getSession()

  if (!session?.user) {
    redirect("/auth/login")
  }

  // Redirect based on role
  // @ts-ignore - role is added to user
  const role = session.user.role || "STUDENT"
  
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
