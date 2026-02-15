"use client"

// Simplified auth client for demo/preview purposes
// Uses localStorage for session management

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  image?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

const SESSION_KEY = "educonnect_session";

// Helper function to generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Get session from localStorage
export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    
    const session: AuthSession = JSON.parse(stored);
    
    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

// Save session to localStorage
function saveSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// Clear session
function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

// Sign up function
export const signUp = {
  email: async (data: {
    email: string;
    password: string;
    name: string;
    role?: string;
    phone?: string;
    department?: string;
    subject?: string;
    university?: string;
  }): Promise<{ data?: { user: AuthUser }; error?: { message: string } }> => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        return { error: { message: result.error || "Registration failed" } };
      }
      
      // Create session
      const session: AuthSession = {
        user: result.data,
        token: generateId(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      };
      
      saveSession(session);
      
      return { data: { user: result.data } };
    } catch (error) {
      console.error("Signup error:", error);
      return { error: { message: "Network error. Please try again." } };
    }
  },
};

// Sign in function
export const signIn = {
  email: async (data: {
    email: string;
    password: string;
  }): Promise<{ data?: { user: AuthUser }; error?: { message: string } }> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        return { error: { message: result.error || "Login failed" } };
      }
      
      // Create session
      const session: AuthSession = {
        user: result.data,
        token: generateId(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      };
      
      saveSession(session);
      
      return { data: { user: result.data } };
    } catch (error) {
      console.error("Login error:", error);
      return { error: { message: "Network error. Please try again." } };
    }
  },
  
  social: async (data: { provider: string; callbackURL?: string }) => {
    // For demo, social login is not supported without proper OAuth setup
    console.log("Social login not available in demo mode");
    return { error: { message: "Social login is not available in demo mode. Please use email/password." } };
  },
};

// Sign out function
export const signOut = async (): Promise<void> => {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Ignore errors
  }
  clearSession();
};

// Get session hook
export function useSession(): { data: AuthSession | null; status: "loading" | "authenticated" | "unauthenticated" } {
  if (typeof window === "undefined") {
    return { data: null, status: "loading" };
  }
  
  const session = getStoredSession();
  
  return {
    data: session,
    status: session ? "authenticated" : "unauthenticated",
  };
}

// Get session function
export async function getSession(): Promise<AuthSession | null> {
  return getStoredSession();
}

// Helper function to get role-based dashboard path
export function getDashboardPath(role?: string): string {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      return "/dashboard/admin";
    case "TEACHER":
      return "/dashboard/teacher";
    case "STUDENT":
    default:
      return "/dashboard/student";
  }
}
