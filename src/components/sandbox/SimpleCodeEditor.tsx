'use client'

import { useState, useRef, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import {
  Play,
  Code2,
  Terminal,
  Loader2,
  AlertCircle,
  X,
  Copy,
  Download,
  Save,
  Plus,
  Trash2,
  FileCode2,
  FolderOpen,
  Eraser,
  ChevronDown
} from 'lucide-react'

interface Project {
  id: string
  name: string
  language: 'javascript' | 'python' | 'sql' | 'c'
  code: string
  createdAt: Date
  updatedAt: Date
}

interface SimpleCodeEditorProps {
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
    syntaxHighlight: (code: string) => {
      // Escape HTML first
      const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      
      // Simple syntax highlighting for JavaScript
      return escaped
        .replace(/(\/\/.*$)/gm, '<span class="text-green-400">$1</span>')
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-green-400">$1</span>')
        .replace(/\b(function|const|let|var|return|if|else|for|while|console|log)\b/g, '<span class="text-purple-400">$1</span>')
        .replace(/(&#039;|&quot;|`)(.*?)(&#039;|&quot;|`)/g, '<span class="text-yellow-400">$1$2$3</span>')
        .replace(/\b(\d+)\b/g, '<span class="text-blue-400">$1</span>')
    }
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
    syntaxHighlight: (code: string) => {
      // Escape HTML first
      const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      
      return escaped
        .replace(/(#.*$)/gm, '<span class="text-green-400">$1</span>')
        .replace(/\b(def|return|if|else|for|while|print|import|from|class)\b/g, '<span class="text-purple-400">$1</span>')
        .replace(/(&#039;|&quot;)(.*?)(&#039;|&quot;)/g, '<span class="text-yellow-400">$1$2$3</span>')
        .replace(/\b(\d+)\b/g, '<span class="text-blue-400">$1</span>')
    }
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
    syntaxHighlight: (code: string) => {
      // Escape HTML first
      const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      
      return escaped
        .replace(/(--.*$)/gm, '<span class="text-green-400">$1</span>')
        .replace(/\b(CREATE|TABLE|INSERT|INTO|VALUES|SELECT|FROM|WHERE|ORDER BY|INTEGER|TEXT|PRIMARY KEY|NOT NULL|DEFAULT|CURRENT_TIMESTAMP|DESC|ASC)\b/gi, '<span class="text-purple-400">$1</span>')
        .replace(/(&#039;|&quot;)(.*?)(&#039;|&quot;)/g, '<span class="text-yellow-400">$1$2$3</span>')
        .replace(/\b(\d+)\b/g, '<span class="text-blue-400">$1</span>')
    }
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
    syntaxHighlight: (code: string) => {
      // Escape HTML first
      const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      
      return escaped
        .replace(/(\/\/.*$)/gm, '<span class="text-green-400">$1</span>')
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-green-400">$1</span>')
        .replace(/(#include\s*&lt;.*?&gt;)/g, '<span class="text-pink-400">$1</span>')
        .replace(/\b(void|int|char|return|if|else|for|while|printf)\b/g, '<span class="text-purple-400">$1</span>')
        .replace(/(&#039;|&quot;)(.*?)(&#039;|&quot;)/g, '<span class="text-yellow-400">$1$2$3</span>')
        .replace(/\b(\d+)\b/g, '<span class="text-blue-400">$1</span>')
    }
  }
}

export default function SimpleCodeEditor({ initialLanguage = 'javascript' }: SimpleCodeEditorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'sql' | 'c'>(initialLanguage)
  const [code, setCode] = useState(LANGUAGE_CONFIG[initialLanguage].defaultCode)
  const [output, setOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showProjectsList, setShowProjectsList] = useState(false)
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [projectName, setProjectName] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('cosmic-code-projects')
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      if (showProjectsList && !target.closest('.projects-dropdown')) {
        setShowProjectsList(false)
      }
      
      if (showLanguageDropdown && !target.closest('.language-dropdown')) {
        setShowLanguageDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showProjectsList, showLanguageDropdown])

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cosmic-code-projects', JSON.stringify(projects))
  }, [projects])

  const executeCode = async () => {
    setIsRunning(true)
    setError(null)
    setOutput(['Executing code...'])

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
          `> ${LANGUAGE_CONFIG[selectedLanguage].name} ${result.version || ''}`,
          '---',
          ...result.output,
          '---',
          `✓ Execution completed in ${result.runtime || 0}ms`
        ])
      } else {
        setError(result.error || 'Code execution failed')
        setOutput(result.output || ['Error executing code'])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setOutput(['Failed to connect to code execution service'])
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
    a.download = `code${LANGUAGE_CONFIG[selectedLanguage].extension}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = textareaRef.current?.selectionStart || 0
      const end = textareaRef.current?.selectionEnd || 0
      const newCode = code.substring(0, start) + '  ' + code.substring(end)
      setCode(newCode)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      }, 0)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-cosmic-void/20 rounded-2xl overflow-hidden border border-white/10">
      {/* Header */}
      <div className="glass-morphism border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Code2 className="w-6 h-6 text-cosmic-aurora" />
            <h2 className="text-xl font-semibold text-white">Code Editor</h2>
            {currentProject && (
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg">
                <FileCode2 className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/80">{currentProject.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Selector Dropdown */}
            <div className="relative language-dropdown">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Dropdown toggle clicked, current state:', showLanguageDropdown)
                  setShowLanguageDropdown(!showLanguageDropdown)
                  setShowProjectsList(false) // Close other dropdowns
                }}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all duration-200 flex items-center gap-2"
              >
                <span>{LANGUAGE_CONFIG[selectedLanguage].icon}</span>
                <span className="text-sm font-medium">{LANGUAGE_CONFIG[selectedLanguage].name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showLanguageDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {showLanguageDropdown && (
                <div
                  className="absolute top-full mt-2 left-0 w-48 bg-gray-900/95 backdrop-blur-xl rounded-lg border border-white/20 shadow-2xl overflow-hidden"
                  style={{ zIndex: 100 }}
                  >
                    {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('Language selected:', key)
                          setSelectedLanguage(key as 'javascript' | 'python' | 'sql' | 'c')
                          setCode(config.defaultCode)
                          setOutput([])
                          setError(null)
                          setShowLanguageDropdown(false)
                          setCurrentProject(null) // Clear current project when switching languages
                        }}
                        className={`w-full px-4 py-2 text-left text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                          selectedLanguage === key
                            ? 'bg-cosmic-aurora/20 text-cosmic-aurora'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{config.icon}</span>
                        {config.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setShowProjectsList(!showProjectsList)}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200 flex items-center gap-2"
                title="Open projects"
              >
                <FolderOpen className="w-4 h-4" />
                <span className="text-sm">Projects</span>
              </button>
              
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
      <div className="flex flex-1 overflow-hidden relative">

        {/* Editor */}
        <div className="flex-1 relative flex flex-col">
          {/* Line numbers and code area */}
          <div className="flex-1 flex bg-black/20">
            {/* Line numbers */}
            <div className="px-4 py-4 text-white/30 text-sm font-mono select-none border-r border-white/10 flex-shrink-0">
              {code.split('\n').map((_, index) => (
                <div key={index} className="h-6 leading-6 text-right pr-2">
                  {index + 1}
                </div>
              ))}
            </div>
            
            {/* Code editor */}
            <div className="flex-1 relative overflow-hidden">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                className="absolute inset-0 w-full h-full p-4 bg-transparent text-white/80 caret-white font-mono text-sm resize-none focus:outline-none selection:bg-cosmic-aurora/30 overflow-auto"
                style={{ lineHeight: '1.5rem' }}
                spellCheck={false}
              />
            </div>
          </div>
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
              className="ml-auto px-2 py-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200 flex items-center gap-1 text-xs"
              title="Clear output"
            >
              <Eraser className="w-3 h-3" />
              Clear
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
            {error ? (
              <div className="text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold mb-1">Error:</div>
                  <div className="text-red-300">{error}</div>
                </div>
              </div>
            ) : output.length > 0 ? (
              <div className="space-y-0.5">
                {output.map((line, index) => {
                  // Style different types of output
                  let className = "text-white/80 break-all"
                  if (line.startsWith('>')) {
                    className = "text-cosmic-aurora font-semibold"
                  } else if (line.startsWith('✓')) {
                    className = "text-green-400 mt-2"
                  } else if (line === '---') {
                    className = "text-white/20"
                  } else if (line.includes('Error') || line.includes('error')) {
                    className = "text-red-300"
                  }
                  
                  return (
                    <div key={index} className={className}>
                      {line || '\u00A0'}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-white/40 italic">
                Click "Run Code" to see output here...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projects List Dropdown */}
      <AnimatePresence>
        {showProjectsList && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="projects-dropdown absolute top-20 left-6 z-50 w-80 glass-morphism rounded-xl border border-white/20 shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Your Projects</h3>
                <button
                  onClick={() => {
                    setCurrentProject(null)
                    setCode(LANGUAGE_CONFIG[selectedLanguage].defaultCode)
                    setShowProjectModal(true)
                    setShowProjectsList(false)
                  }}
                  className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
                  title="New project"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto p-2">
              {projects.length === 0 ? (
                <div className="text-center py-8 text-white/40 text-sm">
                  No projects yet. Create your first one!
                </div>
              ) : (
                <div className="space-y-1">
                  {projects.map(project => (
                    <div
                      key={project.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        currentProject?.id === project.id
                          ? 'bg-cosmic-aurora/20 border border-cosmic-aurora/40'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                      onClick={() => {
                        loadProject(project)
                        setShowProjectsList(false)
                      }}
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
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>

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