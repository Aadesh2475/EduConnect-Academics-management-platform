import { createAuthClient } from "better-auth/react";

const baseURL = typeof window !== 'undefined' 
  ? window.location.origin 
  : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;

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
