import { NextRequest, NextResponse } from 'next/server'

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute'

// Language mapping for Piston API
const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  sql: { language: 'sqlite', version: '3.36.0' },
  c: { language: 'c', version: '10.2.0' }
}

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json()

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      )
    }

    const langConfig = LANGUAGE_MAP[language]
    if (!langConfig) {
      return NextResponse.json(
        { error: 'Unsupported language' },
        { status: 400 }
      )
    }

    // For SQL, we need to wrap the code to make it executable
    let executableCode = code
    if (language === 'sql') {
      executableCode = `.mode column\n.headers on\n${code}`
    }

    // Call Piston API
    const response = await fetch(PISTON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [
          {
            name: `main.${language}`,
            content: executableCode
          }
        ],
        stdin: '',
        args: [],
        compile_timeout: 10000,
        run_timeout: 10000,
        compile_memory_limit: -1,
        run_memory_limit: -1
      })
    })

    if (!response.ok) {
      throw new Error('Failed to execute code')
    }

    const result = await response.json()

    // Format the output
    const output: string[] = []
    
    if (result.compile && result.compile.output) {
      output.push('> Compilation output:')
      output.push(...result.compile.output.split('\n').filter(Boolean))
    }
    
    if (result.run) {
      if (result.run.stdout) {
        output.push(...result.run.stdout.split('\n').filter(Boolean))
      }
      
      if (result.run.stderr) {
        output.push('> Errors:')
        output.push(...result.run.stderr.split('\n').filter(Boolean))
      }
    }

    if (output.length === 0) {
      output.push('> Code executed successfully with no output')
    }

    return NextResponse.json({
      success: true,
      output,
      runtime: result.run?.time || 0,
      language: result.language,
      version: result.version
    })

  } catch (error) {
    console.error('Code execution error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to execute code',
        output: ['> Error executing code']
      },
      { status: 500 }
    )
  }
}