import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function DashboardRedirect() {
  const cookieStore = await cookies()
  const userInfoCookie = cookieStore.get("user_info")?.value
  const sessionToken = cookieStore.get("session_token")?.value

  // If no session, redirect to login
  if (!sessionToken) {
    redirect("/auth/login")
  }

  // Try to get role from user_info cookie
  let role = "STUDENT"
  if (userInfoCookie) {
    try {
      const userInfo = JSON.parse(userInfoCookie)
      role = userInfo.role || "STUDENT"
    } catch {
      // Invalid cookie, use default
    }
  }

  // Redirect based on role
  switch (role.toUpperCase()) {
    case "ADMIN":
      redirect("/dashboard/admin")
    case "TEACHER":
      redirect("/dashboard/teacher")
    case "STUDENT":
    default:
      redirect("/dashboard/student")
  }
}
