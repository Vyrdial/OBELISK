'use client'

import { m } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  HelpCircle,
  Book,
  MessageCircle,
  Settings,
  Zap,
  Users,
  Shield,
  Mail,
  Github,
  ExternalLink
} from 'lucide-react'
import TopNavigationBar from '@/components/ui/TopNavigationBar'
import OptimizedCosmicBackground from '@/components/effects/OptimizedCosmicBackground'
import ClientOnly from '@/components/effects/ClientOnly'

const helpSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Book,
    items: [
      { question: 'What is OBELISK?', answer: 'OBELISK is a revolutionary educational platform that uses cosmic themes and gamification to make learning engaging and memorable.' },
      { question: 'How do I start learning?', answer: 'Visit the Lessons page to begin with Systems Thinking, which unlocks all other domains of knowledge.' },
      { question: 'What are Singularities?', answer: 'Singularities are learners like you! Your avatar represents your unique cosmic identity in the learning universe.' }
    ]
  },
  {
    id: 'features',
    title: 'Features & Tools',
    icon: Zap,
    items: [
      { question: 'What is Stardust?', answer: 'Stardust is the currency you earn by completing lessons and challenges. Use it to customize your avatar and unlock special features.' },
      { question: 'How do I customize my avatar?', answer: 'Visit your Profile page and click the Customize tab to change your style, aura, trail effects, and more.' },
      { question: 'What is the Sandbox?', answer: 'The Sandbox lets you experiment with interactive modules from your completed lessons in a free-play environment.' }
    ]
  },
  {
    id: 'social',
    title: 'Social Features',
    icon: Users,
    items: [
      { question: 'How do I add friends?', answer: 'Go to your Profile > Friends tab and use the "Add Friend" button to send friend requests by username.' },
      { question: 'What are Titles?', answer: 'Titles are special achievements that appear next to your name. Earn them by completing challenges and milestones.' },
      { question: 'Can I change my display name?', answer: 'Yes! Visit Profile > Settings to change your identity. This uses the Name Generator.' }
    ]
  },
  {
    id: 'technical',
    title: 'Technical Support',
    icon: Settings,
    items: [
      { question: 'The site is loading slowly', answer: 'Try refreshing the page or clearing your browser cache. We\'ve optimized performance but complex animations may still impact older devices.' },
      { question: 'I found a bug', answer: 'Please report bugs on our GitHub issues page. Include details about what happened and your browser/device.' },
      { question: 'Is my data secure?', answer: 'Yes! We use Supabase for authentication and data storage with industry-standard encryption and security practices.' }
    ]
  }
]

export default function HelpPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-cosmic-gradient relative overflow-hidden">
      <ClientOnly fallback={<div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-blue-950 to-purple-950" />}>
        <OptimizedCosmicBackground intensity="low" />
      </ClientOnly>
      
      <TopNavigationBar />
      
      <div className="relative z-10 pt-16 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <m.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 glass-morphism mb-6"
            >
              <HelpCircle className="w-10 h-10 text-white" />
            </m.div>
            
            <m.h1 
              className="text-5xl md:text-6xl font-bold text-white mb-4 cosmic-heading"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Help Center
            </m.h1>
            <m.p 
              className="text-white/60 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Find answers to common questions and get support
            </m.p>
          </div>

          {/* Help Sections */}
          <div className="space-y-8">
            {helpSections.map((section, sectionIndex) => (
              <m.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className="glass-morphism rounded-2xl border border-white/20 overflow-hidden"
              >
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <section.icon className="w-6 h-6 text-cosmic-aurora" />
                    <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <m.div
                      key={itemIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
                      className="space-y-2"
                    >
                      <h3 className="text-lg font-semibold text-white">
                        {item.question}
                      </h3>
                      <p className="text-white/70 leading-relaxed">
                        {item.answer}
                      </p>
                    </m.div>
                  ))}
                </div>
              </m.div>
            ))}
          </div>

          {/* Contact Section */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 glass-morphism rounded-2xl border border-white/20 p-8 text-center"
          >
            <Shield className="w-12 h-12 text-cosmic-aurora mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Still Need Help?</h2>
            <p className="text-white/70 mb-6">
              Can't find what you're looking for? We're here to help!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/yourusername/obelisk/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Github className="w-5 h-5" />
                Report an Issue
                <ExternalLink className="w-4 h-4" />
              </a>
              
              <button
                onClick={() => window.location.href = 'mailto:support@obelisk.edu'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-cosmic-aurora/20 hover:bg-cosmic-aurora/30 text-cosmic-aurora rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5" />
                Email Support
              </button>
            </div>
          </m.div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/home')}
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}