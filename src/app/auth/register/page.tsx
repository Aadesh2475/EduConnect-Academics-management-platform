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
  password: z.string().min(6, "Password must be at least 6 characters"),
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
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Admin Schema
const adminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
      const result = await signUp({
        email: data.email,
        password: data.password,
        name: data.name,
        role: "STUDENT",
        phone: data.phone,
      })
      
      if (!result.success || result.error) {
        toast({
          title: "Registration Failed",
          description: result.error || "Something went wrong",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Account Created!",
          description: "Welcome to EduConnect",
        })
        router.push(getDashboardPath("STUDENT"))
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
      const result = await signUp({
        email: data.email,
        password: data.password,
        name: data.name,
        role: "TEACHER",
        phone: data.phone,
        department: data.department,
        subject: data.subject,
        university: data.university,
      })
      
      if (!result.success || result.error) {
        toast({
          title: "Registration Failed",
          description: result.error || "Something went wrong",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Account Created!",
          description: "Welcome to EduConnect",
        })
        router.push(getDashboardPath("TEACHER"))
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
      const result = await signUp({
        email: data.email,
        password: data.password,
        name: data.name,
        role: "ADMIN",
      })
      
      if (!result.success || result.error) {
        toast({
          title: "Registration Failed",
          description: result.error || "Something went wrong",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Account Created!",
          description: "Welcome to EduConnect",
        })
        router.push(getDashboardPath("ADMIN"))
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-xl dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="text-center pb-2">
              {/* Logo */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold dark:text-white">Create Account</CardTitle>
              <CardDescription className="dark:text-gray-400">Join EduConnect today</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4">
              <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as "student" | "teacher" | "admin")}>
                <TabsList className="grid w-full grid-cols-3 mb-6 dark:bg-gray-700">
                  <TabsTrigger value="student" className="dark:data-[state=active]:bg-gray-600">Student</TabsTrigger>
                  <TabsTrigger value="teacher" className="dark:data-[state=active]:bg-gray-600">Teacher</TabsTrigger>
                  <TabsTrigger value="admin" className="dark:data-[state=active]:bg-gray-600">Admin</TabsTrigger>
                </TabsList>

                {/* Student Form */}
                <TabsContent value="student">
                  <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-name" className="dark:text-gray-200">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="student-name"
                          placeholder="John Doe"
                          className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          {...studentForm.register("name")}
                        />
                      </div>
                      {studentForm.formState.errors.name && (
                        <p className="text-sm text-red-500">{studentForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-email" className="dark:text-gray-200">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="student-email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          {...studentForm.register("email")}
                        />
                      </div>
                      {studentForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{studentForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-phone" className="dark:text-gray-200">Phone (Optional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="student-phone"
                          placeholder="+1 234 567 8900"
                          className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          {...studentForm.register("phone")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-password" className="dark:text-gray-200">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="student-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                      <Label htmlFor="student-confirm-password" className="dark:text-gray-200">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="student-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                          Creating account...
                        </>
                      ) : (
                        "Create Student Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Teacher Form */}
                <TabsContent value="teacher">
                  <form onSubmit={teacherForm.handleSubmit(onTeacherSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="teacher-name" className="dark:text-gray-200">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="teacher-name"
                          placeholder="Dr. Jane Smith"
                          className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          {...teacherForm.register("name")}
                        />
                      </div>
                      {teacherForm.formState.errors.name && (
                        <p className="text-sm text-red-500">{teacherForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teacher-email" className="dark:text-gray-200">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="teacher-email"
                          type="email"
                          placeholder="teacher@university.edu"
                          className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          {...teacherForm.register("email")}
                        />
                      </div>
                      {teacherForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{teacherForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="teacher-department" className="dark:text-gray-200">Department</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="teacher-department"
                            placeholder="Computer Science"
                            className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            {...teacherForm.register("department")}
                          />
                        </div>
                        {teacherForm.formState.errors.department && (
                          <p className="text-sm text-red-500">{teacherForm.formState.errors.department.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacher-subject" className="dark:text-gray-200">Subject</Label>
                        <div className="relative">
                          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="teacher-subject"
                            placeholder="Data Structures"
                            className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            {...teacherForm.register("subject")}
                          />
                        </div>
                        {teacherForm.formState.errors.subject && (
                          <p className="text-sm text-red-500">{teacherForm.formState.errors.subject.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teacher-university" className="dark:text-gray-200">University</Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="teacher-university"
                          placeholder="MIT"
                          className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          {...teacherForm.register("university")}
                        />
                      </div>
                      {teacherForm.formState.errors.university && (
                        <p className="text-sm text-red-500">{teacherForm.formState.errors.university.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teacher-password" className="dark:text-gray-200">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="teacher-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                      <Label htmlFor="teacher-confirm-password" className="dark:text-gray-200">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="teacher-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                          Creating account...
                        </>
                      ) : (
                        "Create Teacher Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Admin Form */}
                <TabsContent value="admin">
                  <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-name" className="dark:text-gray-200">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="admin-name"
                          placeholder="Admin Name"
                          className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          {...adminForm.register("name")}
                        />
                      </div>
                      {adminForm.formState.errors.name && (
                        <p className="text-sm text-red-500">{adminForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin-email" className="dark:text-gray-200">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="admin@educonnect.com"
                          className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          {...adminForm.register("email")}
                        />
                      </div>
                      {adminForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{adminForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin-password" className="dark:text-gray-200">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="admin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                      <Label htmlFor="admin-confirm-password" className="dark:text-gray-200">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="admin-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                          Creating account...
                        </>
                      ) : (
                        "Create Admin Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Sign In Link */}
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          By creating an account, you agree to our{" "}
          <a href="#" className="text-blue-600 hover:underline dark:text-blue-400">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="text-blue-600 hover:underline dark:text-blue-400">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
