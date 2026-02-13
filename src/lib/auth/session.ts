import { cookies, headers } from "next/headers";
import prisma from "@/lib/prisma";
import type { SessionUser } from "@/types";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";

// ==================== BETTER AUTH SESSION ====================
export async function getSession(): Promise<SessionUser | null> {
  try {
    // Try to get session from Better Auth first
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user) {
      // Get role from database
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      });

      return {
        id: session.user.id,
        userId: session.user.id,
        email: session.user.email || "",
        name: session.user.name || "",
        image: session.user.image || undefined,
        role: (dbUser?.role || "STUDENT") as SessionUser["role"],
      };
    }

    // Fallback to cookie-based session for backward compatibility
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (!token) return null;

    const dbSession = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    if (!dbSession || dbSession.expires < new Date()) {
      if (dbSession) {
        await prisma.session.delete({ where: { id: dbSession.id } });
      }
      return null;
    }

    return {
      id: dbSession.user.id,
      userId: dbSession.user.id,
      email: dbSession.user.email,
      name: dbSession.user.name,
      image: dbSession.user.image || undefined,
      role: dbSession.user.role as SessionUser["role"],
    };
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
}

// ==================== SESSION MANAGEMENT ====================
export async function createSession(userId: string): Promise<string> {
  const token = uuidv4();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: {
      sessionToken: token,
      userId,
      expires,
    },
  });

  return token;
}

export async function deleteSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (token) {
      await prisma.session.deleteMany({ where: { sessionToken: token } });
    }
  } catch {
    // Ignore
  }
}

// ==================== PASSWORD UTILITIES ====================
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ==================== AUTH MIDDLEWARE ====================
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(roles: SessionUser["role"][]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}
