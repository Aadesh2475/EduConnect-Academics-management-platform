"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Github,
  ArrowLeft,
  Loader2,
  User,
  Phone,
  Building,
  BookOpen,
  GraduationCapIcon,
  ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signUp, signIn } from "@/lib/auth-client"
import { toast } from "@/components/ui/use-toast"

// Student Schema
const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Teacher Schema
const teacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  department: z.string().min(2, "Department is required"),
  subject: z.string().min(2, "Subject is required"),
  university: z.string().min(2, "University name is required"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Admin Schema
const adminSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type StudentFormData = z.infer<typeof studentSchema>
type TeacherFormData = z.infer<typeof teacherSchema>
type AdminFormData = z.infer<typeof adminSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [activeRole, setActiveRole] = useState<"student" | "teacher" | "admin">("student")

  // Student Form
  const studentForm = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  })

  // Teacher Form
  const teacherForm = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
  })

  // Admin Form
  const adminForm = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
  })

  const onStudentSubmit = async (data: StudentFormData) => {
    setIsLoading(true)
    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        role: "STUDENT",
      })
      
      if (result.error) {
        toast({
          title: "Registration Failed",
          description: result.error.message || "Something went wrong",
          variant: "destructive",
        })
      } else {
        // Create student profile via API
        await fetch("/api/profile/student", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: data.phone }),
        })
        
        toast({
          title: "Account Created!",
          description: "Welcome to EduConnect",
          variant: "success",
        })
        router.push("/dashboard/student")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onTeacherSubmit = async (data: TeacherFormData) => {
    setIsLoading(true)
    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        role: "TEACHER",
      })
      
      if (result.error) {
        toast({
          title: "Registration Failed",
          description: result.error.message || "Something went wrong",
          variant: "destructive",
        })
      } else {
        // Create teacher profile via API
        await fetch("/api/profile/teacher", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            department: data.department,
            subject: data.subject,
            university: data.university,
            phone: data.phone,
          }),
        })
        
        toast({
          title: "Account Created!",
          description: "Welcome to EduConnect",
          variant: "success",
        })
        router.push("/dashboard/teacher")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onAdminSubmit = async (data: AdminFormData) => {
    setIsLoading(true)
    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: "Admin",
        role: "ADMIN",
      })
      
      if (result.error) {
        toast({
          title: "Registration Failed",
          description: result.error.message || "Something went wrong",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Admin Account Created!",
          description: "Welcome to EduConnect Admin Panel",
          variant: "success",
        })
        router.push("/dashboard/admin")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthRegister = async (provider: "google" | "github") => {
    setOauthLoading(provider)
    try {
      await signIn.social({
        provider,
        callbackURL: `/auth/complete-profile?role=${activeRole}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to sign up with ${provider}`,
        variant: "destructive",
      })
      setOauthLoading(null)
    }
  }

  const roleConfig = {
    student: {
      icon: <GraduationCapIcon className="w-5 h-5" />,
      title: "Student",
      description: "Join classes and track your progress",
      color: "from-blue-500 to-blue-600",
    },
    teacher: {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Teacher",
      description: "Create classes and manage students",
      color: "from-purple-500 to-purple-600",
    },
    admin: {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "Admin",
      description: "Full platform management",
      color: "from-gray-700 to-gray-800",
    },
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">
        {/* Back to Home */}
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-xl">
            <CardHeader className="text-center pb-2">
              {/* Logo */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <CardDescription>Join EduConnect and start learning</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4">
              {/* Role Selection Tabs */}
              <Tabs 
                value={activeRole} 
                onValueChange={(v) => setActiveRole(v as typeof activeRole)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="student" className="text-xs sm:text-sm">
                    <GraduationCapIcon className="w-4 h-4 mr-1 hidden sm:inline" />
                    Student
                  </TabsTrigger>
                  <TabsTrigger value="teacher" className="text-xs sm:text-sm">
                    <BookOpen className="w-4 h-4 mr-1 hidden sm:inline" />
                    Teacher
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="text-xs sm:text-sm">
                    <ShieldCheck className="w-4 h-4 mr-1 hidden sm:inline" />
                    Admin
                  </TabsTrigger>
                </TabsList>

                {/* OAuth Buttons (for all roles) */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <Button
                    variant="outline"
                    onClick={() => handleOAuthRegister("google")}
                    disabled={!!oauthLoading}
                    className="h-11"
                  >
                    {oauthLoading === "google" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleOAuthRegister("github")}
                    disabled={!!oauthLoading}
                    className="h-11"
                  >
                    {oauthLoading === "github" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Github className="w-5 h-5 mr-2" />
                        GitHub
                      </>
                    )}
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or register with email</span>
                  </div>
                </div>

                {/* Student Form */}
                <TabsContent value="student">
                  <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-name">Full Name</Label>
                      <Input
                        id="student-name"
                        placeholder="John Doe"
                        icon={<User className="w-4 h-4" />}
                        {...studentForm.register("name")}
                        error={studentForm.formState.errors.name?.message}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-email">Email</Label>
                      <Input
                        id="student-email"
                        type="email"
                        placeholder="your@email.com"
                        icon={<Mail className="w-4 h-4" />}
                        {...studentForm.register("email")}
                        error={studentForm.formState.errors.email?.message}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-phone">Phone (Optional)</Label>
                      <Input
                        id="student-phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        icon={<Phone className="w-4 h-4" />}
                        {...studentForm.register("phone")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="student-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          icon={<Lock className="w-4 h-4" />}
                          {...studentForm.register("password")}
                          error={studentForm.formState.errors.password?.message}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="student-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          icon={<Lock className="w-4 h-4" />}
                          {...studentForm.register("confirmPassword")}
                          error={studentForm.formState.errors.confirmPassword?.message}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11" loading={isLoading}>
                      Create Student Account
                    </Button>
                  </form>
                </TabsContent>

                {/* Teacher Form */}
                <TabsContent value="teacher">
                  <form onSubmit={teacherForm.handleSubmit(onTeacherSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="teacher-name">Full Name</Label>
                      <Input
                        id="teacher-name"
                        placeholder="Dr. Jane Smith"
                        icon={<User className="w-4 h-4" />}
                        {...teacherForm.register("name")}
                        error={teacherForm.formState.errors.name?.message}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="teacher-department">Department</Label>
                        <Input
                          id="teacher-department"
                          placeholder="Computer Science"
                          {...teacherForm.register("department")}
                          error={teacherForm.formState.errors.department?.message}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacher-subject">Subject</Label>
                        <Input
                          id="teacher-subject"
                          placeholder="Data Structures"
                          {...teacherForm.register("subject")}
                          error={teacherForm.formState.errors.subject?.message}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teacher-university">University/Institution</Label>
                      <Input
                        id="teacher-university"
                        placeholder="Stanford University"
                        icon={<Building className="w-4 h-4" />}
                        {...teacherForm.register("university")}
                        error={teacherForm.formState.errors.university?.message}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="teacher-email">Email</Label>
                        <Input
                          id="teacher-email"
                          type="email"
                          placeholder="your@email.com"
                          icon={<Mail className="w-4 h-4" />}
                          {...teacherForm.register("email")}
                          error={teacherForm.formState.errors.email?.message}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacher-phone">Phone</Label>
                        <Input
                          id="teacher-phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          icon={<Phone className="w-4 h-4" />}
                          {...teacherForm.register("phone")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teacher-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="teacher-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          icon={<Lock className="w-4 h-4" />}
                          {...teacherForm.register("password")}
                          error={teacherForm.formState.errors.password?.message}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teacher-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="teacher-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          icon={<Lock className="w-4 h-4" />}
                          {...teacherForm.register("confirmPassword")}
                          error={teacherForm.formState.errors.confirmPassword?.message}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11" loading={isLoading}>
                      Create Teacher Account
                    </Button>
                  </form>
                </TabsContent>

                {/* Admin Form */}
                <TabsContent value="admin">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Admin accounts have full access to all platform data and settings. 
                      Only authorized personnel should create admin accounts.
                    </p>
                  </div>

                  <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@educonnect.com"
                        icon={<Mail className="w-4 h-4" />}
                        {...adminForm.register("email")}
                        error={adminForm.formState.errors.email?.message}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="admin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          icon={<Lock className="w-4 h-4" />}
                          {...adminForm.register("password")}
                          error={adminForm.formState.errors.password?.message}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="admin-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          icon={<Lock className="w-4 h-4" />}
                          {...adminForm.register("confirmPassword")}
                          error={adminForm.formState.errors.confirmPassword?.message}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11" loading={isLoading}>
                      Create Admin Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Sign In Link */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By signing up, you agree to our{" "}
          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
