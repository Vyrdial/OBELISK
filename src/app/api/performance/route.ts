import { NextRequest, NextResponse } from 'next/server'
import { ServerPerformanceMonitor, DatabasePool } from '@/lib/serverOptimization'

export async function GET(request: NextRequest) {
  try {
    const dbPool = DatabasePool.getInstance()
    const serverMetrics = ServerPerformanceMonitor.getMetrics()
    const dbStats = dbPool.getStats()

    const performanceData = {
      server: {
        ...serverMetrics,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
      database: {
        ...dbStats,
        poolUtilization: Math.round((dbStats.active / dbStats.max) * 100),
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        cpuUsage: process.cpuUsage(),
      }
    }

    // Add cache headers for performance endpoint
    const response = NextResponse.json(performanceData)
    response.headers.set('Cache-Control', 'public, max-age=10, s-maxage=10')
    
    return response
  } catch (error) {
    console.error('Performance monitoring error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve performance metrics' },
      { status: 500 }
    )
  }
}

// Reset performance metrics
export async function DELETE(request: NextRequest) {
  try {
    ServerPerformanceMonitor.reset()
    
    return NextResponse.json({ 
      message: 'Performance metrics reset successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error resetting performance metrics:', error)
    return NextResponse.json(
      { error: 'Failed to reset performance metrics' },
      { status: 500 }
    )
  }
}