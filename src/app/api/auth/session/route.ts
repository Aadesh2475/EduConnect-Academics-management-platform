import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, data: null })
    }
    return NextResponse.json({ success: true, data: session })
  } catch {
    return NextResponse.json({ success: false, data: null })
  }
}
