'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import { 
  Code2, 
  Brain, 
  Atom, 
  Calculator,
  Sparkles,
  ChevronRight,
  Lock,
  CheckCircle,
  Circle
} from 'lucide-react'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useProfile } from '@/hooks/useProfile'

interface Course {
  id: string
  title: string
  subtitle: string
  description: string
  icon: React.ElementType
  gradient: string
  glowColor: string
  totalLessons: number
  completedLessons: number
  estimatedHours: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  status: 'locked' | 'available' | 'in-progress' | 'completed'
  progress: number
  nextLesson?: string
  skills: string[]
}

const courses: Course[] = [
  {
    id: 'computer-science',
    title: 'Computer Science Fundamentals',
    subtitle: 'Master the art of computational thinking',
    description: 'Journey through binary logic, algorithms, and the architecture of digital systems. Learn to think like a computer scientist.',
    icon: Code2,
    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
    glowColor: 'purple',
    totalLessons: 24,
    completedLessons: 3,
    estimatedHours: 12,
    difficulty: 'Beginner',
    status: 'in-progress',
    progress: 12.5,
    nextLesson: 'Logic Gates',
    skills: ['Binary Logic', 'Algorithms', 'Data Structures', 'Problem Solving']
  },
  {
    id: 'systems-thinking',
    title: 'Systems Thinking',
    subtitle: 'See the patterns that connect everything',
    description: 'Discover the fundamental patterns that appear across all domains. From null cores to universal relativity.',
    icon: Brain,
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    glowColor: 'emerald',
    totalLessons: 16,
    completedLessons: 16,
    estimatedHours: 8,
    difficulty: 'Beginner',
    status: 'completed',
    progress: 100,
    skills: ['Pattern Recognition', 'Abstract Thinking', 'Connections', 'Perspective']
  },
  {
    id: 'mathematics',
    title: 'Mathematics',
    subtitle: 'The language of the universe',
    description: 'From arithmetic to calculus, explore the patterns and relationships that govern our reality.',
    icon: Calculator,
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    glowColor: 'amber',
    totalLessons: 32,
    completedLessons: 0,
    estimatedHours: 20,
    difficulty: 'Intermediate',
    status: 'available',
    progress: 0,
    nextLesson: 'Number Systems',
    skills: ['Algebra', 'Geometry', 'Calculus', 'Statistics']
  },
  {
    id: 'physics',
    title: 'Physics & Chemistry',
    subtitle: 'Understand the fabric of reality',
    description: 'Explore forces, energy, matter, and the fundamental laws that shape our universe.',
    icon: Atom,
    gradient: 'from-blue-600 via-cyan-600 to-sky-600',
    glowColor: 'blue',
    totalLessons: 28,
    completedLessons: 0,
    estimatedHours: 18,
    difficulty: 'Advanced',
    status: 'locked',
    progress: 0,
    skills: ['Mechanics', 'Thermodynamics', 'Quantum', 'Chemistry']
  }
]

function CoursesContent() {
  const router = useRouter()
  const { profile } = useProfile()
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)

  const handleCourseClick = (courseId: string, status: string) => {
    if (status === 'locked') return
    
    setSelectedCourse(courseId)
    setTimeout(() => {
      router.push(`/courses/${courseId}`)
    }, 300)
  }

  const totalProgress = courses.reduce((acc, course) => acc + course.completedLessons, 0)
  const totalLessons = courses.reduce((acc, course) => acc + course.totalLessons, 0)
  const overallProgress = Math.round((totalProgress / totalLessons) * 100)

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Cosmic Background - same as home page */}
      <ClientOnly fallback={<div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-blue-950 to-purple-950" />}>
        <CosmicBackground 
          intensity="low" 
          enableMeteors={false}
          enableNebula={false}
          enablePlanets={false}
        />
      </ClientOnly>
      
      {/* Subtle dark gradient overlay with purple tint for better text readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-indigo-950/30 pointer-events-none z-10" />
      
      <TopNavigationBar />

      <div className="relative z-20 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <m.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 mb-6"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white/80">
              {overallProgress}% Complete
            </span>
            <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
              <m.div 
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </m.div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4">
            <span className="inline-block">
              <m.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Your
              </m.span>
            </span>{' '}
            <span className="inline-block">
              <m.span
                className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Courses
              </m.span>
            </span>
          </h1>
          
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-white/60 max-w-2xl mx-auto"
          >
            Master the fundamental patterns that connect all knowledge
          </m.p>
        </m.div>

        {/* Courses List */}
        <div className="space-y-6">
          {courses.map((course, index) => {
            const Icon = course.icon
            const isHovered = hoveredCourse === course.id
            const isSelected = selectedCourse === course.id
            
            return (
              <m.div
                key={course.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ 
                  opacity: 1, 
                  x: isSelected ? 20 : 0,
                  scale: isSelected ? 0.98 : 1
                }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                onMouseEnter={() => setHoveredCourse(course.id)}
                onMouseLeave={() => setHoveredCourse(null)}
                onClick={() => handleCourseClick(course.id, course.status)}
                className={`relative group cursor-pointer ${
                  course.status === 'locked' ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {/* Glow Effect */}
                <m.div
                  className={`absolute -inset-1 bg-gradient-to-r ${course.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
                  animate={{
                    opacity: isHovered ? 0.3 : 0
                  }}
                />

                {/* Card */}
                <div className={`relative bg-black/40 backdrop-blur-xl rounded-3xl border ${
                  course.status === 'locked' 
                    ? 'border-white/5' 
                    : isHovered 
                    ? 'border-white/20' 
                    : 'border-white/10'
                } overflow-hidden transition-all duration-300`}>
                  
                  {/* Progress Bar Background */}
                  {course.progress > 0 && (
                    <div className="absolute inset-0 opacity-10">
                      <m.div 
                        className={`h-full ${
                          course.id === 'computer-science' ? 'bg-gradient-to-r from-violet-600/50 via-purple-600/50 to-indigo-600/50' :
                          course.id === 'systems-thinking' ? 'bg-gradient-to-r from-emerald-600/50 via-teal-600/50 to-cyan-600/50' :
                          course.id === 'mathematics' ? 'bg-gradient-to-r from-amber-600/50 via-orange-600/50 to-red-600/50' :
                          'bg-gradient-to-r from-blue-600/50 via-cyan-600/50 to-sky-600/50'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                  )}

                  <div className="relative p-8 lg:p-10">
                    <div className="flex items-start gap-8">
                      {/* Icon */}
                      <m.div
                        animate={{
                          scale: isHovered ? 1.05 : 1
                        }}
                        transition={{ duration: 0.3 }}
                        className={`flex-shrink-0 w-20 h-20 rounded-2xl p-0.5 ${
                          course.id === 'computer-science' ? 'bg-gradient-to-br from-violet-600 to-indigo-600' :
                          course.id === 'systems-thinking' ? 'bg-gradient-to-br from-emerald-600 to-cyan-600' :
                          course.id === 'mathematics' ? 'bg-gradient-to-br from-amber-600 to-orange-600' :
                          'bg-gradient-to-br from-blue-600 to-cyan-600'
                        }`}
                      >
                        <div className="w-full h-full bg-black/80 rounded-2xl flex items-center justify-center">
                          <Icon className="w-10 h-10 text-white" />
                        </div>
                      </m.div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h2 className="text-3xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/80 group-hover:bg-clip-text transition-all duration-300">
                              {course.title}
                            </h2>
                            <p className="text-lg text-white/60">
                              {course.subtitle}
                            </p>
                          </div>
                          
                          {/* Status Badge */}
                          <div className="flex items-center gap-3">
                            {course.status === 'completed' && (
                              <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              </div>
                            )}
                            {course.status === 'in-progress' && (
                              <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
                                <div className="flex items-center gap-2">
                                  <Circle className="w-5 h-5 text-purple-400" />
                                  <span className="text-sm text-purple-400">{course.progress}%</span>
                                </div>
                              </div>
                            )}
                            {course.status === 'locked' && (
                              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                                <Lock className="w-5 h-5 text-white/40" />
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-white/70 mb-6 text-lg leading-relaxed">
                          {course.description}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {course.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-white/60"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6 text-sm text-white/50">
                            <span>{course.totalLessons} lessons</span>
                            <span>{course.estimatedHours} hours</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              course.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                              course.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {course.difficulty}
                            </span>
                          </div>

                          {/* CTA */}
                          {course.status !== 'locked' && (
                            <m.div
                              animate={{
                                x: isHovered ? 10 : 0
                              }}
                              className="flex items-center gap-2"
                            >
                              {course.status === 'in-progress' && course.nextLesson && (
                                <span className="text-sm text-white/60">
                                  Next: {course.nextLesson}
                                </span>
                              )}
                              <m.div
                                animate={{
                                  x: isHovered ? 5 : 0
                                }}
                                transition={{
                                  duration: 0.2
                                }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  course.id === 'computer-science' ? 'bg-gradient-to-r from-violet-600 to-indigo-600' :
                                  course.id === 'systems-thinking' ? 'bg-gradient-to-r from-emerald-600 to-cyan-600' :
                                  course.id === 'mathematics' ? 'bg-gradient-to-r from-amber-600 to-orange-600' :
                                  'bg-gradient-to-r from-blue-600 to-cyan-600'
                                }`}
                              >
                                <ChevronRight className="w-5 h-5 text-white" />
                              </m.div>
                            </m.div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar (detailed) */}
                    {course.status === 'in-progress' && (
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white/50">Progress</span>
                          <span className="text-sm text-white/70">
                            {course.completedLessons} / {course.totalLessons} lessons
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <m.div
                            className={`h-full ${
                              course.id === 'computer-science' ? 'bg-gradient-to-r from-violet-600 to-indigo-600' :
                              course.id === 'systems-thinking' ? 'bg-gradient-to-r from-emerald-600 to-cyan-600' :
                              course.id === 'mathematics' ? 'bg-gradient-to-r from-amber-600 to-orange-600' :
                              'bg-gradient-to-r from-blue-600 to-cyan-600'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </m.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function CoursesPage() {
  return (
    <ProtectedRoute>
      <CoursesContent />
    </ProtectedRoute>
  )
}