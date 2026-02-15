import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("session_token")?.value
    const userInfoCookie = req.cookies.get("user_info")?.value

    if (!sessionToken) {
      return NextResponse.json({ 
        success: false, 
        data: null 
      })
    }

    // Try to parse user info from cookie
    if (userInfoCookie) {
      try {
        const userInfo = JSON.parse(userInfoCookie)
        return NextResponse.json({ 
          success: true, 
          data: userInfo 
        })
      } catch {
        // Invalid user info cookie
      }
    }

    // Session exists but no user info - still valid session
    return NextResponse.json({ 
      success: true, 
      data: null 
    })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ 
      success: false, 
      data: null 
    })
  }
}
