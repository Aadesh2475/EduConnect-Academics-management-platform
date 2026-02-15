import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function DashboardRedirect() {
  const cookieStore = await cookies()
  const userInfoCookie = cookieStore.get("user_info")?.value
  const sessionToken = cookieStore.get("session_token")?.value

  if (!sessionToken || !userInfoCookie) {
    redirect("/auth/login")
  }

  try {
    const user = JSON.parse(userInfoCookie)
    const role = user.role || "STUDENT"

    switch (role) {
      case "ADMIN":
        redirect("/dashboard/admin")
      case "TEACHER":
        redirect("/dashboard/teacher")
      case "STUDENT":
      default:
        redirect("/dashboard/student")
    }
  } catch {
    redirect("/auth/login")
  }
}
