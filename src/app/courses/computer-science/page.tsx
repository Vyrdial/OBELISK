'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft,
  Code2,
  Lock,
  CheckCircle,
  Circle,
  Star,
  Zap,
  Trophy,
  ChevronDown,
  Play,
  BookOpen,
  Clock,
  Target,
  Sparkles
} from 'lucide-react'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import CosmicBackground from '@/components/effects/CosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Lesson {
  id: string
  title: string
  description: string
  duration: string
  xp: number
  status: 'locked' | 'available' | 'in-progress' | 'completed'
  type: 'lesson' | 'practice' | 'challenge'
}

interface Module {
  id: string
  title: string
  description: string
  progress: number
  totalLessons: number
  completedLessons: number
  lessons: Lesson[]
  color: string
  isExpanded: boolean
}

const modules: Module[] = [
  {
    id: 'binary-logic',
    title: 'Binary Logic',
    description: 'The foundation of digital thinking',
    progress: 60,
    totalLessons: 5,
    completedLessons: 3,
    color: 'purple',
    isExpanded: true,
    lessons: [
      {
        id: 'on-off',
        title: 'On and Off',
        description: 'The binary nature of logical states',
        duration: '15 min',
        xp: 100,
        status: 'available',
        type: 'lesson'
      },
      {
        id: 'gates-and-tables-1',
        title: 'Gates and Tables 1',
        description: 'AND, OR, NOT operations',
        duration: '20 min',
        xp: 150,
        status: 'available',
        type: 'lesson'
      },
      {
        id: 'wiring-gates',
        title: 'Puzzle: Wiring Gates',
        description: 'Interactive challenges with Byte guiding you',
        duration: '30 min',
        xp: 300,
        status: 'available',
        type: 'practice'
      },
      {
        id: 'gates-and-tables-2',
        title: 'Gates and Tables 2',
        description: 'Mapping all possible outcomes',
        duration: '25 min',
        xp: 200,
        status: 'available',
        type: 'lesson'
      },
      {
        id: 'boolean-algebra',
        title: 'Boolean Algebra',
        description: 'Mathematical operations on logical values',
        duration: '30 min',
        xp: 250,
        status: 'available',
        type: 'challenge'
      }
    ]
  },
  {
    id: 'set-theory',
    title: 'Set Theory',
    description: 'Collections, relationships, and data foundations',
    progress: 0,
    totalLessons: 4,
    completedLessons: 0,
    color: 'blue',
    isExpanded: false,
    lessons: [
      {
        id: 'sets-elements',
        title: 'Sets and Elements',
        description: 'Understanding collections',
        duration: '20 min',
        xp: 150,
        status: 'available',
        type: 'lesson'
      },
      {
        id: 'set-operations',
        title: 'Set Operations',
        description: 'Union, intersection, difference',
        duration: '25 min',
        xp: 200,
        status: 'locked',
        type: 'lesson'
      },
      {
        id: 'venn-diagrams',
        title: 'Venn Diagrams',
        description: 'Visualizing relationships',
        duration: '15 min',
        xp: 100,
        status: 'locked',
        type: 'practice'
      },
      {
        id: 'cardinality',
        title: 'Cardinality',
        description: 'Counting and infinite sets',
        duration: '30 min',
        xp: 250,
        status: 'locked',
        type: 'challenge'
      }
    ]
  },
  {
    id: 'algorithms',
    title: 'Algorithms',
    description: 'Step-by-step problem solving',
    progress: 0,
    totalLessons: 5,
    completedLessons: 0,
    color: 'green',
    isExpanded: false,
    lessons: [
      {
        id: 'what-are-algorithms',
        title: 'What are Algorithms?',
        description: 'Introduction to algorithmic thinking',
        duration: '15 min',
        xp: 100,
        status: 'locked',
        type: 'lesson'
      },
      {
        id: 'sorting',
        title: 'Sorting Algorithms',
        description: 'Bubble, merge, and quick sort',
        duration: '30 min',
        xp: 250,
        status: 'locked',
        type: 'lesson'
      },
      {
        id: 'searching',
        title: 'Searching Algorithms',
        description: 'Linear and binary search',
        duration: '25 min',
        xp: 200,
        status: 'locked',
        type: 'lesson'
      },
      {
        id: 'complexity',
        title: 'Time Complexity',
        description: 'Big O notation basics',
        duration: '20 min',
        xp: 150,
        status: 'locked',
        type: 'practice'
      },
      {
        id: 'recursion',
        title: 'Recursion',
        description: 'Functions that call themselves',
        duration: '35 min',
        xp: 300,
        status: 'locked',
        type: 'challenge'
      }
    ]
  },
  {
    id: 'data-structures',
    title: 'Data Structures',
    description: 'Organizing information efficiently',
    progress: 0,
    totalLessons: 6,
    completedLessons: 0,
    color: 'orange',
    isExpanded: false,
    lessons: [
      {
        id: 'arrays',
        title: 'Arrays',
        description: 'Ordered collections',
        duration: '20 min',
        xp: 150,
        status: 'locked',
        type: 'lesson'
      },
      {
        id: 'linked-lists',
        title: 'Linked Lists',
        description: 'Dynamic data structures',
        duration: '25 min',
        xp: 200,
        status: 'locked',
        type: 'lesson'
      },
      {
        id: 'stacks-queues',
        title: 'Stacks & Queues',
        description: 'LIFO and FIFO structures',
        duration: '30 min',
        xp: 250,
        status: 'locked',
        type: 'lesson'
      },
      {
        id: 'trees',
        title: 'Trees',
        description: 'Hierarchical structures',
        duration: '35 min',
        xp: 300,
        status: 'locked',
        type: 'lesson'
      },
      {
        id: 'graphs',
        title: 'Graphs',
        description: 'Networks and connections',
        duration: '40 min',
        xp: 350,
        status: 'locked',
        type: 'challenge'
      },
      {
        id: 'hash-tables',
        title: 'Hash Tables',
        description: 'Fast lookups with hashing',
        duration: '30 min',
        xp: 250,
        status: 'locked',
        type: 'challenge'
      }
    ]
  }
]

function ComputerScienceContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [expandedModules, setExpandedModules] = useState<string[]>(['binary-logic'])
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch completed lessons from database
  useEffect(() => {
    async function fetchCompletedLessons() {
      if (!user) {
        console.log('No user, skipping fetch')
        setLoading(false)
        return
      }
      
      try {
        console.log('Fetching completed lessons for user:', user.id)
        
        const { data, error } = await supabase
          .from('lesson_completions')
          .select('lesson_id')
          .eq('user_id', user.id)
        
        console.log('Fetch result:', { data, error })
        
        if (error) {
          console.error('Error fetching completed lessons:', error)
          // Check if table doesn't exist
          if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
            console.error('lesson_completions table not found. Please run FIX_LESSON_COMPLETIONS.sql in Supabase')
          }
        } else if (data) {
          const lessonIds = data.map(item => item.lesson_id)
          console.log('Completed lesson IDs:', lessonIds)
          setCompletedLessons(lessonIds)
        } else {
          console.log('No data returned')
          setCompletedLessons([])
        }
      } catch (err) {
        console.error('Error fetching completed lessons:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCompletedLessons()
  }, [user])

  // Process modules with actual completion status
  const processedModules = modules.map(module => {
    const updatedLessons = module.lessons.map(lesson => ({
      ...lesson,
      status: completedLessons.includes(lesson.id) ? 'completed' as const : 'available' as const
    }))
    
    const completedCount = updatedLessons.filter(l => l.status === 'completed').length
    
    return {
      ...module,
      lessons: updatedLessons,
      completedLessons: completedCount,
      progress: Math.round((completedCount / module.totalLessons) * 100)
    }
  })

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const handleLessonClick = (lesson: Lesson, moduleId: string) => {
    if (lesson.status === 'locked') return
    
    setSelectedLesson(lesson.id)
    setTimeout(() => {
      router.push(`/courses/computer-science/${moduleId}/${lesson.id}`)
    }, 300)
  }

  const totalXP = processedModules.reduce((acc, module) => 
    acc + module.lessons.filter(l => l.status === 'completed').reduce((sum, l) => sum + l.xp, 0), 0
  )

  const totalProgress = processedModules.reduce((acc, module) => acc + module.completedLessons, 0)
  const totalLessons = processedModules.reduce((acc, module) => acc + module.totalLessons, 0)
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

      <div className="relative z-20 px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/courses')}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </button>

          <div className="flex items-start gap-6">
            <m.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-0.5"
            >
              <div className="w-full h-full bg-black/80 rounded-2xl flex items-center justify-center">
                <Code2 className="w-10 h-10 text-white" />
              </div>
            </m.div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                Computer Science Fundamentals
              </h1>
              <p className="text-white/60 text-lg">
                Master the art of computational thinking
              </p>
            </div>
          </div>
        </m.div>

        {/* Stats Bar */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
            <Trophy className="w-5 h-5 text-yellow-400 mb-2" />
            <div className="text-2xl font-bold text-white">{totalXP}</div>
            <div className="text-xs text-white/50">Total XP</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
            <Zap className="w-5 h-5 text-orange-400 mb-2" />
            <div className="text-2xl font-bold text-white">7</div>
            <div className="text-xs text-white/50">Day Streak</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
            <Star className="w-5 h-5 text-purple-400 mb-2" />
            <div className="text-2xl font-bold text-white">{totalProgress}/{totalLessons}</div>
            <div className="text-xs text-white/50">Lessons</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
            <Target className="w-5 h-5 text-green-400 mb-2" />
            <div className="text-2xl font-bold text-white">{overallProgress}%</div>
            <div className="text-xs text-white/50">Complete</div>
          </div>
        </m.div>

        {/* Progress Path - Duolingo Style */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/10 -translate-x-1/2" />

          {/* Modules */}
          <div className="space-y-8">
            {processedModules.map((module, moduleIndex) => (
              <m.div
                key={module.id}
                initial={{ opacity: 0, x: moduleIndex % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: moduleIndex * 0.1 }}
                className="relative"
              >
                {/* Module Card */}
                <div
                  className={`relative bg-black/40 backdrop-blur-xl rounded-3xl border ${
                    module.completedLessons > 0 
                      ? 'border-white/20' 
                      : 'border-white/10'
                  } overflow-hidden`}
                >

                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="relative w-full p-6 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Module Icon */}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                          module.color === 'purple' ? 'bg-purple-500/20 border-2 border-purple-500/40' :
                          module.color === 'blue' ? 'bg-blue-500/20 border-2 border-blue-500/40' :
                          module.color === 'green' ? 'bg-green-500/20 border-2 border-green-500/40' :
                          'bg-orange-500/20 border-2 border-orange-500/40'
                        }`}>
                          {module.completedLessons === module.totalLessons ? (
                            <CheckCircle className={`w-8 h-8 ${
                              module.color === 'purple' ? 'text-purple-400' :
                              module.color === 'blue' ? 'text-blue-400' :
                              module.color === 'green' ? 'text-green-400' :
                              'text-orange-400'
                            }`} />
                          ) : module.completedLessons > 0 ? (
                            <div className="relative">
                              <Circle className={`w-8 h-8 ${
                                module.color === 'purple' ? 'text-purple-400' :
                                module.color === 'blue' ? 'text-blue-400' :
                                module.color === 'green' ? 'text-green-400' :
                                'text-orange-400'
                              }`} />
                              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                                {module.completedLessons}
                              </span>
                            </div>
                          ) : (
                            <Circle className="w-8 h-8 text-white/40" />
                          )}
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            {module.title}
                          </h3>
                          <p className="text-white/60 text-sm">
                            {module.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                            <span>{module.completedLessons}/{module.totalLessons} lessons</span>
                            <span>{module.progress}% complete</span>
                          </div>
                        </div>
                      </div>

                      <m.div
                        animate={{ rotate: expandedModules.includes(module.id) ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-6 h-6 text-white/40" />
                      </m.div>
                    </div>

                    {/* Module Progress Bar */}
                    <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                      <m.div
                        className={`h-full ${
                          module.color === 'purple' ? 'bg-gradient-to-r from-purple-400 to-purple-500' :
                          module.color === 'blue' ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                          module.color === 'green' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                          'bg-gradient-to-r from-orange-400 to-orange-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${module.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 + moduleIndex * 0.1 }}
                      />
                    </div>
                  </button>

                  {/* Lessons */}
                  <AnimatePresence>
                    {expandedModules.includes(module.id) && (
                      <m.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/10"
                      >
                        <div className="p-6 space-y-3">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <m.button
                              key={lesson.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: lessonIndex * 0.05 }}
                              onClick={() => handleLessonClick(lesson, module.id)}
                              disabled={lesson.status === 'locked'}
                              className={`w-full p-4 rounded-2xl border transition-all ${
                                lesson.status === 'locked'
                                  ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                                  : lesson.status === 'completed'
                                  ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
                                  : lesson.status === 'in-progress'
                                  ? 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  {/* Lesson Icon */}
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    lesson.status === 'completed'
                                      ? 'bg-green-500/20'
                                      : lesson.status === 'in-progress'
                                      ? 'bg-purple-500/20'
                                      : lesson.status === 'available'
                                      ? 'bg-white/10'
                                      : 'bg-white/5'
                                  }`}>
                                    {lesson.status === 'completed' ? (
                                      <CheckCircle className="w-6 h-6 text-green-400" />
                                    ) : lesson.status === 'locked' ? (
                                      <Lock className="w-6 h-6 text-white/30" />
                                    ) : lesson.type === 'challenge' ? (
                                      <Trophy className="w-6 h-6 text-yellow-400" />
                                    ) : lesson.type === 'practice' ? (
                                      <Target className="w-6 h-6 text-blue-400" />
                                    ) : (
                                      <BookOpen className="w-6 h-6 text-white/60" />
                                    )}
                                  </div>

                                  <div className="text-left">
                                    <h4 className="text-white font-semibold mb-1">
                                      {lesson.title}
                                    </h4>
                                    <p className="text-white/60 text-sm">
                                      {lesson.description}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <div className="flex items-center gap-1 text-yellow-400">
                                      <Sparkles className="w-4 h-4" />
                                      <span className="text-sm font-semibold">+{lesson.xp}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-white/50">
                                      <Clock className="w-3 h-3" />
                                      <span className="text-xs">{lesson.duration}</span>
                                    </div>
                                  </div>
                                  
                                  {lesson.status === 'available' && (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                      <Play className="w-5 h-5 text-white ml-0.5" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </m.button>
                          ))}
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Connection Node */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 w-8 h-8 bg-black rounded-full border-2 border-white/20 flex items-center justify-center">
                  <div className={`w-4 h-4 rounded-full ${
                    module.completedLessons === module.totalLessons
                      ? (module.color === 'purple' ? 'bg-purple-400' :
                         module.color === 'blue' ? 'bg-blue-400' :
                         module.color === 'green' ? 'bg-green-400' :
                         'bg-orange-400')
                      : module.completedLessons > 0
                      ? (module.color === 'purple' ? 'bg-purple-400/50' :
                         module.color === 'blue' ? 'bg-blue-400/50' :
                         module.color === 'green' ? 'bg-green-400/50' :
                         'bg-orange-400/50')
                      : 'bg-white/20'
                  }`} />
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ComputerSciencePage() {
  return (
    <ProtectedRoute>
      <ComputerScienceContent />
    </ProtectedRoute>
  )
}