'use client'

import { useState, useRef, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  Play,
  Square,
  Code2,
  Terminal,
  FileCode,
  Loader2,
  AlertCircle,
  CheckCircle,
  Zap,
  X,
  Copy,
  Download,
  Upload,
  Save,
  FolderOpen,
  Plus,
  Trash2
} from 'lucide-react'

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface Project {
  id: string
  name: string
  language: 'javascript' | 'python' | 'sql' | 'c'
  code: string
  createdAt: Date
  updatedAt: Date
}

interface CodeEditorProps {
  initialLanguage?: 'javascript' | 'python' | 'sql' | 'c'
}

const LANGUAGE_CONFIG = {
  javascript: {
    name: 'JavaScript',
    icon: '🟨',
    extension: '.js',
    defaultCode: `// Welcome to the Code Editor!
// Write your JavaScript code here

function greet(name) {
  return \`Hello, \${name}! Welcome to the cosmos! 🌟\`;
}

console.log(greet("Singularity"));

// Try some cosmic calculations
const stardust = 42;
const cosmicEnergy = stardust * 2;
console.log(\`Cosmic energy level: \${cosmicEnergy}\`);
`,
    monacoLanguage: 'javascript'
  },
  python: {
    name: 'Python',
    icon: '🐍',
    extension: '.py',
    defaultCode: `# Welcome to the Code Editor!
# Write your Python code here

def greet(name):
    return f"Hello, {name}! Welcome to the cosmos! 🌟"

print(greet("Singularity"))

# Try some cosmic calculations
stardust = 42
cosmic_energy = stardust * 2
print(f"Cosmic energy level: {cosmic_energy}")
`,
    monacoLanguage: 'python'
  },
  sql: {
    name: 'SQL',
    icon: '🗄️',
    extension: '.sql',
    defaultCode: `-- Welcome to the Code Editor!
-- Write your SQL queries here

-- Create a cosmic database
CREATE TABLE singularities (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    energy_level INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some data
INSERT INTO singularities (name, energy_level) 
VALUES 
    ('Alpha', 100),
    ('Beta', 200),
    ('Gamma', 150);

-- Query the cosmic data
SELECT name, energy_level 
FROM singularities 
WHERE energy_level > 100
ORDER BY energy_level DESC;
`,
    monacoLanguage: 'sql'
  },
  c: {
    name: 'C',
    icon: '⚡',
    extension: '.c',
    defaultCode: `// Welcome to the Code Editor!
// Write your C code here

#include <stdio.h>

void greet(char* name) {
    printf("Hello, %s! Welcome to the cosmos! 🌟\\n", name);
}

int main() {
    greet("Singularity");
    
    // Try some cosmic calculations
    int stardust = 42;
    int cosmic_energy = stardust * 2;
    printf("Cosmic energy level: %d\\n", cosmic_energy);
    
    return 0;
}
`,
    monacoLanguage: 'c'
  }
}

export default function CodeEditor({ initialLanguage = 'javascript' }: CodeEditorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'sql' | 'c'>(initialLanguage)
  const [code, setCode] = useState(LANGUAGE_CONFIG[initialLanguage].defaultCode)
  const [output, setOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [projectName, setProjectName] = useState('')
  const editorRef = useRef<any>(null)

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('cosmic-code-projects')
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }, [])

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cosmic-code-projects', JSON.stringify(projects))
  }, [projects])

  const executeCode = async () => {
    setIsRunning(true)
    setError(null)
    setOutput(['> Executing code...'])

    try {
      const response = await fetch('/api/code-execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage
        })
      })

      const result = await response.json()

      if (result.success) {
        setOutput([
          `> Running ${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} code...`,
          ...result.output,
          '',
          `> Execution completed in ${result.runtime}ms`
        ])
      } else {
        setError(result.error || 'Code execution failed')
        setOutput(result.output || ['> Error executing code'])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setOutput(['> Failed to connect to code execution service'])
    } finally {
      setIsRunning(false)
    }
  }


  const saveProject = () => {
    if (!projectName.trim()) return

    const project: Project = {
      id: Date.now().toString(),
      name: projectName,
      language: selectedLanguage,
      code: code,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    if (currentProject) {
      // Update existing project
      const updatedProjects = projects.map(p =>
        p.id === currentProject.id ? { ...project, id: currentProject.id } : p
      )
      setProjects(updatedProjects)
    } else {
      // Create new project
      setProjects([...projects, project])
    }

    setCurrentProject(project)
    setShowProjectModal(false)
    setProjectName('')
  }

  const loadProject = (project: Project) => {
    setCurrentProject(project)
    setSelectedLanguage(project.language)
    setCode(project.code)
    setOutput([])
    setError(null)
  }

  const deleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId))
    if (currentProject?.id === projectId) {
      setCurrentProject(null)
      setCode(LANGUAGE_CONFIG[selectedLanguage].defaultCode)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
  }

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cosmic-code${LANGUAGE_CONFIG[selectedLanguage].extension}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-cosmic-void/20 rounded-2xl overflow-hidden border border-white/10">
      {/* Header */}
      <div className="glass-morphism border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Code2 className="w-6 h-6 text-cosmic-aurora" />
            <h2 className="text-xl font-semibold text-white">Cosmic Code Editor</h2>
            {currentProject && (
              <span className="text-sm text-white/60">
                {currentProject.name}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedLanguage(key as any)
                    setCode(config.defaultCode)
                    setOutput([])
                    setError(null)
                  }}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    selectedLanguage === key
                      ? 'bg-cosmic-aurora/20 text-cosmic-aurora'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{config.icon}</span>
                  {config.name}
                </button>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={copyCode}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
                title="Copy code"
              >
                <Copy className="w-4 h-4" />
              </button>
              
              <button
                onClick={downloadCode}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
                title="Download code"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowProjectModal(true)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
                title="Save project"
              >
                <Save className="w-4 h-4" />
              </button>
              
              <button
                onClick={executeCode}
                disabled={isRunning}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  isRunning
                    ? 'bg-white/10 text-white/40 cursor-not-allowed'
                    : 'bg-cosmic-aurora hover:bg-cosmic-aurora/80 text-white'
                }`}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Projects Sidebar */}
        <div className="w-64 glass-morphism border-r border-white/10 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/80">Projects</h3>
            <button
              onClick={() => {
                setCurrentProject(null)
                setCode(LANGUAGE_CONFIG[selectedLanguage].defaultCode)
                setShowProjectModal(true)
              }}
              className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            {projects.map(project => (
              <div
                key={project.id}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentProject?.id === project.id
                    ? 'bg-cosmic-aurora/20 border border-cosmic-aurora/40'
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
                onClick={() => loadProject(project)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{LANGUAGE_CONFIG[project.language].icon}</span>
                    <span className="text-sm text-white/80">{project.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteProject(project.id)
                    }}
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-red-400 transition-all duration-200"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-xs text-white/40 mt-1">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 relative">
          <MonacoEditor
            height="100%"
            language={LANGUAGE_CONFIG[selectedLanguage].monacoLanguage}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'Fira Code, monospace',
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 }
            }}
            onMount={(editor) => {
              editorRef.current = editor
            }}
          />
        </div>

        {/* Output Console */}
        <div className="w-96 glass-morphism border-l border-white/10 flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <Terminal className="w-4 h-4 text-cosmic-aurora" />
            <h3 className="text-sm font-medium text-white">Console Output</h3>
            <button
              onClick={() => {
                setOutput([])
                setError(null)
              }}
              className="ml-auto p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
            {error ? (
              <div className="text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : output.length > 0 ? (
              <div className="space-y-1">
                {output.map((line, index) => (
                  <div key={index} className="text-white/80">
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-white/40 italic">
                Click "Run Code" to see output here...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Save Modal */}
      <AnimatePresence>
        {showProjectModal && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProjectModal(false)}
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-morphism rounded-xl border border-white/20 p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                {currentProject ? 'Update Project' : 'Save New Project'}
              </h3>
              
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name..."
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-cosmic-aurora/50 transition-all duration-200"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && saveProject()}
              />
              
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProject}
                  disabled={!projectName.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    projectName.trim()
                      ? 'bg-cosmic-aurora hover:bg-cosmic-aurora/80 text-white'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  {currentProject ? 'Update' : 'Save'}
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}