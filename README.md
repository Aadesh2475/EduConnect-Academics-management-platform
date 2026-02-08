# EduConnect - Modern Learning Management Platform

A comprehensive educational platform built with Next.js 16, featuring AI-powered analytics, real-time collaboration, and professional dashboards for students, teachers, and administrators.

![EduConnect](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🌟 Features

### Authentication & Authorization
- **Multi-role system**: Student, Teacher, Admin
- **OAuth providers**: Google & GitHub login
- **Secure authentication** using Better Auth
- **Password reset** functionality
- **Rate limiting** for API protection

### Student Dashboard
- **Home**: Overview with stats, charts, and upcoming deadlines
- **Classes**: Join classes with unique codes, view enrolled courses
- **Assignments**: Submit work, track deadlines
- **Quiz/Exams**: Take assessments with auto-grading
- **Attendance**: Track attendance records
- **Performance Analytics**: Charts and progress tracking
- **AI Chatbot**: Personalized learning suggestions
- **Calendar & Events**: Schedule management
- **Messages**: Real-time communication
- **Tasks**: Personal task management

### Teacher Dashboard
- **Class Management**: Create classes with unique codes
- **Student Management**: Approve join requests, manage enrollments
- **Assignments**: Create, grade, provide feedback
- **Examinations**: Build quizzes with multiple question types
- **Attendance**: Mark and track student attendance
- **Announcements**: Post updates to classes
- **Analytics**: Class performance insights
- **Library**: Share learning materials

### Admin Dashboard
- **User Management**: View/manage all students and teachers
- **System Analytics**: Platform-wide statistics
- **Class Overview**: Monitor all classes
- **Activity Logs**: Track user actions
- **System Health**: Server and database monitoring

### Additional Features
- **Skeleton Loading**: Professional loading states
- **Responsive Design**: Mobile-first approach
- **Animations**: Smooth transitions with Framer Motion
- **Real-time Updates**: Live notifications
- **Caching**: Performance optimization
- **Rate Limiting**: API protection

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | TailwindCSS 4, Framer Motion |
| UI Components | Radix UI, Lucide Icons |
| Backend | Next.js API Routes, Server Actions |
| Database | PostgreSQL (Neon), Prisma ORM |
| Authentication | Better Auth (OAuth + Credentials) |
| Charts | Recharts |
| Forms | React Hook Form, Zod validation |
| State | React hooks, Server components |

## 📁 Project Structure

```
webapp/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Authentication endpoints
│   │   │   ├── ai/        # AI chatbot
│   │   │   ├── classes/   # Class management
│   │   │   └── profile/   # User profiles
│   │   ├── auth/          # Auth pages (login, register)
│   │   ├── dashboard/
│   │   │   ├── student/   # Student dashboard pages
│   │   │   ├── teacher/   # Teacher dashboard pages
│   │   │   └── admin/     # Admin dashboard pages
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Landing page
│   ├── components/
│   │   ├── dashboard/     # Dashboard-specific components
│   │   │   ├── student/   # Student sidebar, header
│   │   │   ├── teacher/   # Teacher sidebar, header
│   │   │   └── admin/     # Admin sidebar, header
│   │   └── ui/            # Reusable UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── skeleton.tsx
│   │       └── ...
│   └── lib/
│       ├── auth.ts        # Better Auth config
│       ├── auth-client.ts # Client-side auth
│       ├── cache.ts       # Caching utilities
│       ├── prisma.ts      # Database client
│       ├── rate-limit.ts  # Rate limiting
│       └── utils.ts       # Helper functions
├── .env                   # Environment variables
├── .env.example           # Example env file
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon account)
- Google OAuth credentials
- GitHub OAuth credentials

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd webapp
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://username:password@ep-xxx.region.neon.tech/database?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="your-super-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth - Google
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OAuth - GitHub
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# OpenAI (optional - for AI Chatbot)
OPENAI_API_KEY="your-openai-api-key"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="EduConnect"
```

4. **Set up database**
```bash
npm run db:generate
npm run db:push
```

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Core Models
- **User**: Base user with role (STUDENT/TEACHER/ADMIN)
- **Student**: Extended student profile
- **Teacher**: Extended teacher profile
- **Class**: Virtual classroom with unique codes
- **ClassEnrollment**: Student-class relationship with approval status

### Academic Models
- **Assignment**: Tasks with deadlines and rubrics
- **Submission**: Student assignment submissions
- **Exam**: Quizzes and tests
- **Question**: Multiple types (MCQ, True/False, Short/Long Answer)
- **ExamAttempt**: Student exam attempts

### Tracking Models
- **Attendance**: Daily attendance records
- **Performance**: Monthly performance metrics
- **Notification**: User notifications
- **Task**: Personal task lists

### Communication
- **ChatRoom**: Direct and group chats
- **Message**: Chat messages
- **Announcement**: Class announcements

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/[...all]` - Better Auth handlers
- `POST /api/auth/forgot-password` - Password reset

### Classes
- `GET /api/classes` - List classes
- `POST /api/classes` - Create class
- `GET /api/classes/[id]` - Get class details
- `PUT /api/classes/[id]` - Update class
- `DELETE /api/classes/[id]` - Delete class
- `POST /api/classes/join` - Join class with code

### Profiles
- `GET/POST/PUT /api/profile/student` - Student profile
- `GET/POST/PUT /api/profile/teacher` - Teacher profile

### AI
- `POST /api/ai/chat` - AI chatbot interaction

## 🎨 UI Components

Built with Radix UI primitives and styled with TailwindCSS:

- **Button**: Multiple variants (default, outline, ghost, destructive)
- **Card**: Container with hover effects
- **Dialog**: Modal dialogs
- **Input/Textarea**: Form inputs with validation
- **Select**: Dropdown selects
- **Tabs**: Tab navigation
- **Accordion**: Collapsible content
- **Avatar**: User avatars with fallbacks
- **Badge**: Status indicators
- **Progress**: Progress bars
- **Skeleton**: Loading placeholders
- **Toast**: Notifications
- **Dropdown Menu**: Context menus

## 📱 Responsive Design

- Mobile-first approach
- Sidebar collapses on mobile
- Touch-friendly interactions
- Adaptive layouts

## 🔧 Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Production build
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio

# Linting
npm run lint         # Run ESLint
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Set environment variables
3. Deploy

### Other Platforms
1. Build the application: `npm run build`
2. Set environment variables
3. Start: `npm run start`

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

Built with ❤️ using Next.js 16 and modern web technologies.
