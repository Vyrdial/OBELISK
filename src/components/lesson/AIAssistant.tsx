'use client'

import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface AIAssistantProps {
  className?: string
  lessonContext?: string
}

export default function AIAssistant({ className = '', lessonContext = 'space fundamentals' }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/lagom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Context: User is learning about ${lessonContext}. Question: ${input.trim()}`,
          history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.dialog || data.error || 'I understand. Let me help you with that.',
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.',
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting. Please try again later.',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <m.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed top-44 right-8 w-14 h-14 bg-cosmic-void backdrop-blur-sm border-2 border-white/40 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-cosmic-void/80 hover:border-white/60 z-[60] transition-all cursor-pointer ${className}`}
      >
        <MessageCircle className="w-6 h-6 pointer-events-none" />
      </m.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
            />

            {/* Panel */}
            <m.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-cosmic-void/95 backdrop-blur-md border-l border-white/20 shadow-2xl z-[71] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cosmic-aurora/20 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-cosmic-aurora" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">AI Assistant</h2>
                      <p className="text-xs text-white/60">Ask questions about the lesson</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-white/40 mb-2">No messages yet</p>
                    <p className="text-white/30 text-sm">Ask me anything about {lessonContext}!</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <m.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-xl ${
                          message.role === 'user'
                            ? 'bg-cosmic-aurora text-white'
                            : 'bg-white/10 text-white/90'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </m.div>
                  ))
                )}
                {isLoading && (
                  <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/10 p-3 rounded-xl">
                      <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
                    </div>
                  </m.div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage()
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 bg-white/10 text-white placeholder-white/40 px-4 py-2 rounded-lg outline-none focus:bg-white/20 transition-colors"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-2 bg-cosmic-aurora text-white rounded-lg hover:bg-cosmic-aurora/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
                <p className="text-xs text-white/40 mt-2 text-center">
                  Press ESC to close
                </p>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}