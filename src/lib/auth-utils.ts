import { cookies } from "next/headers";
import prisma from "./prisma";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// Constants
const SESSION_COOKIE_NAME = "session_token";
const SESSION_EXPIRY_DAYS = 30;

// Types
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: string;
  theme: string;
}

// Get current session from cookie
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    // Find session and validate
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            theme: true,
          },
        },
      },
    });

    if (!session || session.expires < new Date()) {
      // Delete expired session
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      role: session.user.role,
      theme: session.user.theme,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

// Create a new session
export async function createSession(userId: string): Promise<string> {
  const sessionToken = uuidv4();
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_EXPIRY_DAYS);

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
  });

  return sessionToken;
}

// Delete session
export async function deleteSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      await prisma.session.deleteMany({ where: { sessionToken } });
    }
  } catch (error) {
    console.error("Error deleting session:", error);
  }
}

// Delete all sessions for a user
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Require authentication - throws if not authenticated
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

// Require specific role - throws if not authorized
export async function requireRole(allowedRoles: string[]): Promise<SessionUser> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    throw new Error("Forbidden");
  }
  return session;
}

// Get user by email
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

// Check if email exists
export async function emailExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  return !!user;
}

// Update user theme preference
export async function updateUserTheme(
  userId: string,
  theme: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { theme },
  });
}

// Get user with profile
export async function getUserWithProfile(userId: string, role: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      student: role === "STUDENT",
      teacher: role === "TEACHER",
    },
  });
  return user;
}
