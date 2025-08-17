'use client'

import { useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { Activity, Zap, Database, Gauge } from 'lucide-react'
import { usePerformanceBenchmark, useRealTimePerformanceMonitor } from '@/lib/performanceBenchmark'
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization'

interface PerformanceCardProps {
  title: string
  value: string | number
  grade: 'good' | 'needs-improvement' | 'poor'
  icon: React.ReactNode
  description: string
}

function PerformanceCard({ title, value, grade, icon, description }: PerformanceCardProps) {
  const gradeColors = {
    good: 'from-green-500 to-emerald-600',
    'needs-improvement': 'from-yellow-500 to-orange-500',
    poor: 'from-red-500 to-pink-600'
  }

  const gradeText = {
    good: 'Excellent',
    'needs-improvement': 'Needs Work',
    poor: 'Poor'
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${gradeColors[grade]}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-white font-semibold">{title}</h3>
            <p className="text-white/60 text-sm">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className={`text-sm ${
            grade === 'good' ? 'text-green-400' : 
            grade === 'needs-improvement' ? 'text-yellow-400' : 
            'text-red-400'
          }`}>
            {gradeText[grade]}
          </div>
        </div>
      </div>
      
      <div className="w-full bg-white/20 rounded-full h-2">
        <m.div
          initial={{ width: 0 }}
          animate={{ width: grade === 'good' ? '100%' : grade === 'needs-improvement' ? '60%' : '30%' }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-2 rounded-full bg-gradient-to-r ${gradeColors[grade]}`}
        />
      </div>
    </m.div>
  )
}

function RealtimeMetrics() {
  const { fps, memoryUsage, domNodes, isHealthy } = useRealTimePerformanceMonitor()
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <div className="flex items-center gap-3 mb-4">
        <Activity className="w-5 h-5 text-cosmic-aurora" />
        <h3 className="text-white font-semibold">Real-time Monitoring</h3>
        <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{fps}</div>
          <div className="text-white/60 text-sm">FPS</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{memoryUsage}MB</div>
          <div className="text-white/60 text-sm">Memory</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{domNodes}</div>
          <div className="text-white/60 text-sm">DOM Nodes</div>
        </div>
      </div>
    </div>
  )
}

function OptimizationStatus() {
  const { metrics } = usePerformanceOptimization()
  
  const optimizations = [
    { name: 'Bundle Splitting', status: 'active', impact: 'High' },
    { name: 'Intelligent Preloading', status: 'active', impact: 'Medium' },
    { name: 'Advanced Caching', status: 'active', impact: 'High' },
    { name: 'Tab Visibility API', status: 'active', impact: 'Medium' },
    { name: 'Progressive Loading', status: 'active', impact: 'Medium' },
    { name: 'Server Optimization', status: 'active', impact: 'High' },
  ]
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-5 h-5 text-cosmic-aurora" />
        <h3 className="text-white font-semibold">Active Optimizations</h3>
      </div>
      
      <div className="space-y-3">
        {optimizations.map((opt, index) => (
          <m.div
            key={opt.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white">{opt.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                opt.impact === 'High' ? 'bg-green-500/20 text-green-400' :
                opt.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {opt.impact}
              </span>
              <span className="text-green-400 text-sm">Active</span>
            </div>
          </m.div>
        ))}
      </div>
    </div>
  )
}

function TrendsAnalysis() {
  const { trends } = usePerformanceBenchmark()
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-5 h-5 text-cosmic-aurora" />
        <h3 className="text-white font-semibold">Performance Trends</h3>
      </div>
      
      {trends.improvements.length > 0 && (
        <div className="mb-4">
          <h4 className="text-green-400 font-medium mb-2">🚀 Improvements</h4>
          <ul className="space-y-1">
            {trends.improvements.map((improvement, index) => (
              <li key={index} className="text-green-300 text-sm">• {improvement}</li>
            ))}
          </ul>
        </div>
      )}
      
      {trends.regressions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-red-400 font-medium mb-2">⚠️ Regressions</h4>
          <ul className="space-y-1">
            {trends.regressions.map((regression, index) => (
              <li key={index} className="text-red-300 text-sm">• {regression}</li>
            ))}
          </ul>
        </div>
      )}
      
      {trends.recommendations.length > 0 && (
        <div>
          <h4 className="text-blue-400 font-medium mb-2">💡 Recommendations</h4>
          <ul className="space-y-1">
            {trends.recommendations.map((rec, index) => (
              <li key={index} className="text-blue-300 text-sm">• {rec}</li>
            ))}
          </ul>
        </div>
      )}
      
      {trends.improvements.length === 0 && trends.regressions.length === 0 && trends.recommendations.length === 0 && (
        <p className="text-white/60 text-sm">No significant trends detected yet. Run the app for a while to see analysis.</p>
      )}
    </div>
  )
}

export default function PerformanceDashboard() {
  const { metrics, getGrade, isSupported } = usePerformanceBenchmark()
  const [showDashboard, setShowDashboard] = useState(false)

  if (!isSupported) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-white">
          <p className="text-sm">Performance monitoring not supported in this browser</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!showDashboard ? (
        <m.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowDashboard(true)}
          className="w-14 h-14 bg-gradient-to-r from-cosmic-aurora to-cosmic-starlight rounded-full flex items-center justify-center shadow-lg"
        >
          <Gauge className="w-6 h-6 text-white" />
        </m.button>
      ) : (
        <m.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-gradient-to-br from-cosmic-void/90 to-cosmic-deep/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-4xl w-screen max-h-[80vh] overflow-y-auto"
          style={{ width: 'min(90vw, 1000px)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Gauge className="w-6 h-6 text-cosmic-aurora" />
              <h2 className="text-2xl font-bold text-white">Performance Dashboard</h2>
            </div>
            <button
              onClick={() => setShowDashboard(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PerformanceCard
              title="First Contentful Paint"
              value={`${Math.round(metrics.fcp || 0)}ms`}
              grade={getGrade('fcp', metrics.fcp || 0)}
              icon={<Zap className="w-5 h-5 text-white" />}
              description="Time to first visible content"
            />
            
            <PerformanceCard
              title="Largest Contentful Paint"
              value={`${Math.round(metrics.lcp || 0)}ms`}
              grade={getGrade('lcp', metrics.lcp || 0)}
              icon={<Activity className="w-5 h-5 text-white" />}
              description="Time to largest content element"
            />
            
            <PerformanceCard
              title="Cumulative Layout Shift"
              value={(metrics.cls || 0).toFixed(3)}
              grade={getGrade('cls', metrics.cls || 0)}
              icon={<Database className="w-5 h-5 text-white" />}
              description="Visual stability score"
            />
            
            <PerformanceCard
              title="First Input Delay"
              value={`${Math.round(metrics.fid || 0)}ms`}
              grade={getGrade('fid', metrics.fid || 0)}
              icon={<Gauge className="w-5 h-5 text-white" />}
              description="Interactivity responsiveness"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <RealtimeMetrics />
              <OptimizationStatus />
            </div>
            <TrendsAnalysis />
          </div>
        </m.div>
      )}
    </div>
  )
}