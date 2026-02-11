import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import type { SessionUser } from "@/types";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

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

export async function getSession(): Promise<(SessionUser & { userId: string }) | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return null;
    }

    return {
      id: session.user.id,
      userId: session.user.id, // Alias for backward compatibility
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      role: session.user.role as SessionUser["role"],
    };
  } catch {
    return null;
  }
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
