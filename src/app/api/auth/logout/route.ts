import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth/session"

export async function POST() {
  try {
    await deleteSession()
    const response = NextResponse.json({ success: true, message: "Logged out" })
    response.cookies.delete("session_token")
    return response
  } catch {
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 })
  }
}
