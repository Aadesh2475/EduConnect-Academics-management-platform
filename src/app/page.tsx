"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  GraduationCap, Users, BookOpen, BarChart3, Brain, Calendar,
  MessageSquare, Shield, ChevronRight, Star, CheckCircle2,
  Menu, X, ArrowRight, Sparkles, Award, Clock, Bell,
  FileText, PieChart, Zap, Globe, Lock, TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
}

const features = [
  {
    icon: BookOpen,
    title: "Smart Classrooms",
    description: "Create and manage virtual classrooms with unique join codes. Seamless student enrollment with request-based approval.",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50"
  },
  {
    icon: FileText,
    title: "Assignment Management",
    description: "Create assignments with rubric-based grading, track submissions, and provide detailed feedback to students.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50"
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Comprehensive dashboards with charts, graphs, and trends to track academic progress in real-time.",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50"
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Smart chatbot analyzes performance data and provides personalized suggestions for academic improvement.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50"
  },
  {
    icon: Calendar,
    title: "Attendance & Calendar",
    description: "Mark attendance, schedule events, manage academic calendar with automated tracking and reminders.",
    color: "from-rose-500 to-pink-500",
    bg: "bg-rose-50"
  },
  {
    icon: MessageSquare,
    title: "Real-time Messaging",
    description: "Instant messaging between students and teachers. Class group chats and direct messaging support.",
    color: "from-indigo-500 to-blue-500",
    bg: "bg-indigo-50"
  }
]

const stats = [
  { label: "Active Institutions", value: "500+", icon: Globe },
  { label: "Students Connected", value: "50K+", icon: Users },
  { label: "Classes Created", value: "10K+", icon: BookOpen },
  { label: "Assignments Graded", value: "1M+", icon: Award },
]

const howItWorks = [
  {
    step: "01",
    title: "Create Your Account",
    description: "Sign up as a Student, Teacher, or Organization using Google, GitHub, or email.",
    icon: Users
  },
  {
    step: "02",
    title: "Set Up Classes",
    description: "Teachers create classes with unique codes. Students join with a simple code entry.",
    icon: BookOpen
  },
  {
    step: "03",
    title: "Manage Academics",
    description: "Assignments, exams, attendance, and performance tracking all in one place.",
    icon: BarChart3
  },
  {
    step: "04",
    title: "Get AI Insights",
    description: "AI analyzes your performance and provides personalized improvement suggestions.",
    icon: Sparkles
  }
]

const faqs = [
  {
    question: "How do students join a class?",
    answer: "Teachers generate a unique 7-character class code. Students enter this code on their dashboard to send a join request, which the teacher can approve or reject."
  },
  {
    question: "What authentication methods are supported?",
    answer: "We support Google OAuth, GitHub OAuth, and traditional email/password authentication. All methods include email verification and password reset functionality."
  },
  {
    question: "How does the AI chatbot work?",
    answer: "Our AI chatbot analyzes your academic data including grades, attendance, submission patterns, and exam scores to provide personalized study suggestions and performance insights."
  },
  {
    question: "Can teachers track student attendance?",
    answer: "Yes! Teachers can mark attendance for each class session, view attendance reports, and students can see their attendance statistics in their dashboard."
  },
  {
    question: "Is the platform free to use?",
    answer: "Yes, the core features are completely free. We offer premium plans for institutions that need advanced analytics, bulk management, and priority support."
  },
  {
    question: "How secure is my data?",
    answer: "We use industry-standard encryption, secure session management, rate limiting, and role-based access control. Your data is stored securely and never shared with third parties."
  }
]

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "Professor, Computer Science",
    content: "EduConnect has transformed how I manage my classes. The analytics dashboard gives me instant insights into student performance.",
    rating: 5
  },
  {
    name: "Alex Rivera",
    role: "Engineering Student",
    content: "The AI chatbot helped me identify my weak areas and suggested study plans. My grades improved significantly in just one semester.",
    rating: 5
  },
  {
    name: "Prof. James Miller",
    role: "Department Head",
    content: "Managing multiple classes and tracking hundreds of students was chaotic before. EduConnect made it seamless and organized.",
    rating: 5
  }
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* ========== HEADER ========== */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Edu<span className="text-indigo-600">Connect</span></span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#analytics" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Analytics</a>
              <a href="#ai" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">AI Integration</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">How it Works</a>
              <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">FAQ</a>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-700">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200/50">
                  Get Started <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-200"
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#features" className="block py-2 text-sm font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#how-it-works" className="block py-2 text-sm font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
                <a href="#faq" className="block py-2 text-sm font-medium text-gray-700" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                <div className="flex gap-2 pt-2">
                  <Link href="/login" className="flex-1"><Button variant="outline" className="w-full">Log in</Button></Link>
                  <Link href="/signup" className="flex-1"><Button className="w-full">Get Started</Button></Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========== HERO ========== */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-violet-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-medium text-indigo-700 mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Academic Platform
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6">
              Transform Your
              <span className="block gradient-text">Academic Experience</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              A comprehensive platform connecting students, teachers, and institutions.
              Manage classrooms, track performance, and get AI-powered insights — all in one place.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-xl shadow-indigo-200/50 text-base px-8 h-12">
                  Start for Free <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="text-base px-8 h-12">
                  See How it Works
                </Button>
              </a>
            </motion.div>

            {/* Stats row */}
            <motion.div variants={fadeInUp} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon className="h-5 w-5 text-indigo-600" />
                    <span className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</span>
                  </div>
                  <span className="text-sm text-gray-500">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 relative"
          >
            <div className="relative mx-auto max-w-5xl">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/50 overflow-hidden">
                {/* Window bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 bg-white rounded-md text-xs text-gray-400 border border-gray-200">
                      educonnect.app/dashboard
                    </div>
                  </div>
                </div>
                {/* Dashboard mockup */}
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {[
                      { label: "Enrolled Classes", value: "6", color: "text-blue-600", bg: "bg-blue-50", icon: BookOpen },
                      { label: "Pending Assignments", value: "3", color: "text-amber-600", bg: "bg-amber-50", icon: FileText },
                      { label: "Attendance Rate", value: "94%", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
                      { label: "Performance Score", value: "A+", color: "text-violet-600", bg: "bg-violet-50", icon: TrendingUp },
                    ].map((card, i) => (
                      <div key={i} className={`${card.bg} rounded-xl p-4 border border-gray-100`}>
                        <card.icon className={`h-5 w-5 ${card.color} mb-2`} />
                        <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{card.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 bg-white rounded-xl p-4 border border-gray-100 h-48">
                      <div className="text-sm font-medium text-gray-700 mb-3">Performance Trend</div>
                      <div className="flex items-end gap-2 h-32">
                        {[40, 55, 45, 70, 65, 80, 75, 90, 85, 92, 88, 95].map((h, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-indigo-500 to-violet-400 rounded-t-sm opacity-80" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 h-48">
                      <div className="text-sm font-medium text-gray-700 mb-3">Upcoming</div>
                      <div className="space-y-2">
                        {["Math Quiz - Tomorrow", "Physics Lab - Wed", "Assignment Due - Fri"].map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-gray-600 py-1.5 px-2 bg-gray-50 rounded-lg">
                            <Clock className="h-3 w-3 text-indigo-500" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-purple-500/10 rounded-3xl -z-10 blur-2xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="py-20 md:py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600 mb-4">
              <Zap className="h-3.5 w-3.5" /> FEATURES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for <span className="gradient-text">Academic Excellence</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed for modern education management
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== ANALYTICS SECTION ========== */}
      <section id="analytics" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-xs font-semibold text-emerald-600 mb-4">
                <PieChart className="h-3.5 w-3.5" /> ANALYTICS
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Powerful Analytics for <span className="gradient-text">Smarter Decisions</span>
              </h2>
              <p className="text-gray-600 mb-8">
                Track every aspect of academic performance with real-time dashboards, detailed reports, and trend analysis.
              </p>
              <div className="space-y-4">
                {[
                  "Real-time performance tracking with interactive charts",
                  "Attendance analytics with pattern recognition",
                  "Assignment completion rates and submission trends",
                  "Exam score distribution and grade analysis",
                  "Student engagement metrics and activity logs"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">Student Performance Overview</h3>
                  <span className="text-xs text-gray-500">Last 6 months</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Avg. Score", value: "87%", change: "+5.2%", up: true },
                    { label: "Attendance", value: "92%", change: "+2.1%", up: true },
                    { label: "Completion", value: "95%", change: "+8.4%", up: true },
                  ].map((metric, i) => (
                    <div key={i} className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                      <div className="text-xs text-gray-500 mb-1">{metric.label}</div>
                      <div className={`text-xs font-medium ${metric.up ? "text-emerald-600" : "text-red-600"}`}>
                        <TrendingUp className="h-3 w-3 inline mr-0.5" />{metric.change}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-40 flex items-end gap-1.5">
                  {[65, 72, 68, 85, 78, 90, 88, 92, 87, 95, 91, 98].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-500 to-violet-400 transition-all hover:opacity-90" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
                </div>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-100/50 to-violet-100/50 rounded-3xl -z-10 blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== AI SECTION ========== */}
      <section id="ai" className="py-20 md:py-32 bg-gradient-to-br from-indigo-950 via-violet-950 to-purple-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-violet-500 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-indigo-300 mb-4 border border-white/10">
              <Brain className="h-3.5 w-3.5" /> AI INTEGRATION
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet Your AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Academic Advisor</span>
            </h2>
            <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
              Get personalized suggestions based on your attendance, marks, submissions, and activities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {[
                { icon: TrendingUp, title: "Performance Analysis", desc: "AI reviews your grades, attendance patterns, and submission history to identify strengths and weaknesses." },
                { icon: Sparkles, title: "Smart Suggestions", desc: "Receive personalized study recommendations, focus area suggestions, and improvement strategies." },
                { icon: Bell, title: "Proactive Alerts", desc: "Get notified about declining performance trends before they become critical." },
                { icon: BarChart3, title: "Predictive Insights", desc: "AI predicts potential exam scores and provides targeted preparation advice." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="shrink-0 p-2 rounded-lg bg-indigo-500/20">
                    <item.icon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-indigo-200">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Chat mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">EduConnect AI</h3>
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
                  </span>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex justify-end">
                  <div className="bg-indigo-600 rounded-2xl rounded-br-sm px-4 py-2 text-sm max-w-[80%]">
                    How am I performing this semester?
                  </div>
                </div>
                <div className="flex">
                  <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3 text-sm max-w-[85%] space-y-2">
                    <p>Based on your data this semester:</p>
                    <div className="space-y-1 text-indigo-200">
                      <p>📊 Overall Score: <strong className="text-white">87%</strong> (A)</p>
                      <p>✅ Attendance: <strong className="text-white">92%</strong></p>
                      <p>📝 Submissions: <strong className="text-white">14/15</strong> on time</p>
                    </div>
                    <p className="text-indigo-300 text-xs mt-2">💡 <em>Suggestion: Focus on Data Structures — your quiz scores suggest room for improvement. I recommend reviewing Chapters 7-9.</em></p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-indigo-300">
                  Ask about your performance...
                </div>
                <button className="p-2.5 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-xs font-semibold text-amber-600 mb-4">
              <Clock className="h-3.5 w-3.5" /> HOW IT WORKS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Started in <span className="gradient-text">4 Simple Steps</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white mb-4 shadow-lg shadow-indigo-200">
                  <step.icon className="h-7 w-7" />
                </div>
                <div className="text-xs font-bold text-indigo-600 mb-2">{step.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
                {i < howItWorks.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute top-8 -right-4 h-6 w-6 text-gray-300" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by <span className="gradient-text">Educators & Students</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold text-sm">
                    {t.name[0]}{t.name.split(" ")[1]?.[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section id="faq" className="py-20 md:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-gray-600">Everything you need to know about EduConnect</p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${openFaq === i ? "rotate-90" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-8 md:p-12 text-center text-white overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Education?
              </h2>
              <p className="text-lg text-indigo-100 mb-8 max-w-xl mx-auto">
                Join thousands of students and educators already using EduConnect
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-indigo-700 hover:bg-gray-100 shadow-xl text-base px-8 h-12">
                    Get Started Free <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 text-base px-8 h-12">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">EduConnect</span>
              </Link>
              <p className="text-sm leading-relaxed">
                Empowering education through technology. Connecting students, teachers, and institutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Platform</h4>
              <div className="space-y-2.5 text-sm">
                <a href="#features" className="block hover:text-white transition-colors">Features</a>
                <a href="#analytics" className="block hover:text-white transition-colors">Analytics</a>
                <a href="#ai" className="block hover:text-white transition-colors">AI Integration</a>
                <a href="#" className="block hover:text-white transition-colors">Pricing</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Resources</h4>
              <div className="space-y-2.5 text-sm">
                <a href="#" className="block hover:text-white transition-colors">Documentation</a>
                <a href="#" className="block hover:text-white transition-colors">API Reference</a>
                <a href="#" className="block hover:text-white transition-colors">Help Center</a>
                <a href="#faq" className="block hover:text-white transition-colors">FAQ</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Legal</h4>
              <div className="space-y-2.5 text-sm">
                <a href="#" className="block hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="block hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="block hover:text-white transition-colors">Cookie Policy</a>
                <a href="#" className="block hover:text-white transition-colors">Security</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">&copy; {new Date().getFullYear()} EduConnect. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Lock className="h-4 w-4" />
              <span className="text-xs">Secured with industry-standard encryption</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
