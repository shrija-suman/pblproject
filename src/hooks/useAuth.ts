// src/hooks/useAuth.ts

export interface UserType {
  userId: string
  userName: string
  email: string
  role?: string
}

export function useAuth() {
  const user: UserType = {
    userId: "1", // you can replace with real user ID
    userName: "Guest",
    email: "guest@example.com", // default/fake email
    role: "USER"
  }

  const isAuthenticated = false // default; set true after login

  const signIn = async () => {
    // your login logic
    console.log("Signing in…")
  }

  const signOut = async () => {
    // your logout logic
    console.log("Signing out…")
  }

  return { user, isAuthenticated, userRole: user.role, signIn, signOut }
}
