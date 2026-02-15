"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  User,
  Phone,
  Building,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signUp, getDashboardPath } from "@/lib/auth-client"
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
  name: z.string().min(2, "Name must be at least 2 characters"),
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
        phone: data.phone,
      })
      
      if (result.error) {
        toast({
          title: "Registration Failed",
          description: result.error.message || "Something went wrong",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Account Created!",
          description: "Welcome to EduConnect",
        })
        router.push("/dashboard/student")
        router.refresh()
      }
    } catch (error) {
      console.error("Registration error:", error)
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
        phone: data.phone,
        department: data.department,
        subject: data.subject,
        university: data.university,
      })
      
      if (result.error) {
        toast({
          title: "Registration Failed",
          description: result.error.message || "Something went wrong",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Account Created!",
          description: "Welcome to EduConnect",
        })
        router.push("/dashboard/teacher")
        router.refresh()
      }
    } catch (error) {
      console.error("Registration error:", error)
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
        name: data.name,
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
          title: "Account Created!",
          description: "Welcome to EduConnect Admin Panel",
        })
        router.push("/dashboard/admin")
        router.refresh()
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
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
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <CardDescription>Join EduConnect today</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4">
              <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as any)}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="student" className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Student
                  </TabsTrigger>
                  <TabsTrigger value="teacher" className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    Teacher
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    Admin
                  </TabsTrigger>
                </TabsList>

                {/* Student Registration Form */}
                <TabsContent value="student">
                  <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="student-name"
                          placeholder="John Doe"
                          className="pl-10"
                          {...studentForm.register("name")}
                        />
                      </div>
                      {studentForm.formState.errors.name && (
                        <p className="text-sm text-red-500">{studentForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="student-email"
                          type="email"
                          placeholder="student@example.com"
                          className="pl-10"
                          {...studentForm.register("email")}
                        />
                      </div>
                      {studentForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{studentForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-phone">Phone (Optional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="student-phone"
                          placeholder="+1234567890"
                          className="pl-10"
                          {...studentForm.register("phone")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="student-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...studentForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {studentForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{studentForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="student-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...studentForm.register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {studentForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500">{studentForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full h-11" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Student Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Teacher Registration Form */}
                <TabsContent value="teacher">
                  <form onSubmit={teacherForm.handleSubmit(onTeacherSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="teacher-name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="teacher-name"
                            placeholder="Dr. Jane Smith"
                            className="pl-10"
                            {...teacherForm.register("name")}
                          />
                        </div>
                        {teacherForm.formState.errors.name && (
                          <p className="text-sm text-red-500">{teacherForm.formState.errors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacher-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="teacher-email"
                            type="email"
                            placeholder="teacher@example.com"
                            className="pl-10"
                            {...teacherForm.register("email")}
                          />
                        </div>
                        {teacherForm.formState.errors.email && (
                          <p className="text-sm text-red-500">{teacherForm.formState.errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="teacher-department">Department</Label>
                        <Input
                          id="teacher-department"
                          placeholder="Computer Science"
                          {...teacherForm.register("department")}
                        />
                        {teacherForm.formState.errors.department && (
                          <p className="text-sm text-red-500">{teacherForm.formState.errors.department.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacher-subject">Subject</Label>
                        <Input
                          id="teacher-subject"
                          placeholder="Data Structures"
                          {...teacherForm.register("subject")}
                        />
                        {teacherForm.formState.errors.subject && (
                          <p className="text-sm text-red-500">{teacherForm.formState.errors.subject.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="teacher-university">University</Label>
                        <Input
                          id="teacher-university"
                          placeholder="MIT"
                          {...teacherForm.register("university")}
                        />
                        {teacherForm.formState.errors.university && (
                          <p className="text-sm text-red-500">{teacherForm.formState.errors.university.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacher-phone">Phone (Optional)</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="teacher-phone"
                            placeholder="+1234567890"
                            className="pl-10"
                            {...teacherForm.register("phone")}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teacher-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="teacher-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...teacherForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {teacherForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{teacherForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teacher-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="teacher-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...teacherForm.register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {teacherForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500">{teacherForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full h-11" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Teacher Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Admin Registration Form */}
                <TabsContent value="admin">
                  <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="admin-name"
                          placeholder="Admin Name"
                          className="pl-10"
                          {...adminForm.register("name")}
                        />
                      </div>
                      {adminForm.formState.errors.name && (
                        <p className="text-sm text-red-500">{adminForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="admin@example.com"
                          className="pl-10"
                          {...adminForm.register("email")}
                        />
                      </div>
                      {adminForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{adminForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="admin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...adminForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {adminForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{adminForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="admin-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...adminForm.register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {adminForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500">{adminForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full h-11" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Admin Account"
                      )}
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
