import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, createSession, emailExists } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, phone, department, subject, university } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if email already exists
    if (await emailExists(email)) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 }
      );
    }

    // Validate role
    const validRoles = ["STUDENT", "TEACHER", "ADMIN"];
    const userRole = role && validRoles.includes(role.toUpperCase()) ? role.toUpperCase() : "STUDENT";

    // Additional validation for teacher
    if (userRole === "TEACHER") {
      if (!department || !subject || !university) {
        return NextResponse.json(
          { success: false, error: "Department, subject, and university are required for teachers" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with transaction to ensure data consistency
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          password: hashedPassword,
          role: userRole,
          provider: "CREDENTIALS",
        },
      });

      // Create role-specific profile
      if (userRole === "STUDENT") {
        await tx.student.create({
          data: {
            userId: newUser.id,
            phone: phone || null,
          },
        });
      } else if (userRole === "TEACHER") {
        await tx.teacher.create({
          data: {
            userId: newUser.id,
            department,
            subject,
            university,
            phone: phone || null,
          },
        });
      }

      return newUser;
    });

    // Create session
    const sessionToken = await createSession(user.id);

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      message: "Account created successfully",
    });

    // Set session cookie
    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
