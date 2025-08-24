export interface ConceptData {
  id: string
  address: string // Unique cosmic address like "0x7A9F"
  name: string
  category: 'binary' | 'logic' | 'systems' | 'algorithms' | 'data' | 'philosophy'
  description: string
  longDescription: string
  unlockRequirements?: string[]
  relatedConcepts?: string[]
  discoveredBy?: string // Which lesson unlocked it
  icon?: string
  color: string
}

export const allConcepts: ConceptData[] = [
  // Binary & Logic Concepts
  {
    id: 'binary-states',
    address: '0x0001',
    name: 'Binary States',
    category: 'binary',
    description: 'The foundation of digital logic - ON and OFF',
    longDescription: 'Binary states represent the two fundamental positions in digital systems: ON (1, true, HIGH) and OFF (0, false, LOW). These states form the basis of all computational logic, where electrical current either flows or doesn\'t flow through a circuit.',
    relatedConcepts: ['logic-gates', 'binary-algebra'],
    discoveredBy: 'on-off',
    color: 'purple'
  },
  {
    id: 'logic-gates',
    address: '0x0002',
    name: 'Logic Gates',
    category: 'logic',
    description: 'Circuits that perform logical operations on binary inputs',
    longDescription: 'Logic gates are the building blocks of digital circuits. They take one or more binary inputs and produce a single binary output based on logical rules. The fundamental gates include AND, OR, NOT, XOR, NAND, and NOR.',
    unlockRequirements: ['binary-states'],
    relatedConcepts: ['binary-states', 'truth-tables', 'binary-algebra'],
    discoveredBy: 'logic-gates',
    color: 'blue'
  },
  {
    id: 'truth-tables',
    address: '0x0003',
    name: 'State Tables',
    category: 'logic',
    description: 'Complete mapping of all possible input-output combinations',
    longDescription: 'State tables systematically list all possible combinations of inputs and their corresponding outputs for logical operations. They provide a complete specification of how a logical system behaves.',
    unlockRequirements: ['logic-gates'],
    relatedConcepts: ['logic-gates', 'binary-algebra'],
    discoveredBy: 'truth-tables',
    color: 'green'
  },
  {
    id: 'binary-algebra',
    address: '0x0004',
    name: 'Binary Algebra',
    category: 'logic',
    description: 'Mathematical operations on logical values',
    longDescription: 'Binary algebra is a branch of algebra where variables have only two possible values: true or false. It provides the mathematical foundation for digital logic design and computer science.',
    unlockRequirements: ['logic-gates', 'truth-tables'],
    relatedConcepts: ['logic-gates', 'truth-tables', 'binary-states'],
    color: 'indigo'
  },
  
  // Systems Thinking Concepts
  {
    id: 'null-core',
    address: '0x1000',
    name: 'Null Core',
    category: 'systems',
    description: 'The void from which all existence emerges',
    longDescription: 'The Null Core represents the fundamental state of nothingness - not merely empty, but the potential for everything. It is the canvas upon which reality is painted, the silence between notes that makes music possible.',
    relatedConcepts: ['singularity', 'emergence'],
    discoveredBy: 'null-core',
    color: 'gray'
  },
  {
    id: 'universal-relativity',
    address: '0x1001',
    name: 'Universal Relativity',
    category: 'systems',
    description: 'Everything exists in relation to everything else',
    longDescription: 'Universal Relativity states that nothing exists in isolation. Every entity, concept, and phenomenon gains meaning through its relationships with others. Perspective shapes reality.',
    relatedConcepts: ['null-core', 'axis-fundamentals'],
    discoveredBy: 'universal-relativity',
    color: 'cyan'
  },
  {
    id: 'axis-fundamentals',
    address: '0x1002',
    name: 'Axis Fundamentals',
    category: 'systems',
    description: 'Dimensional spectrums that define existence',
    longDescription: 'Axes are continuous spectrums between opposing states. They provide the framework for understanding gradients, transitions, and the space between extremes.',
    unlockRequirements: ['universal-relativity'],
    relatedConcepts: ['universal-relativity', 'axis-combinations'],
    discoveredBy: 'axis-fundamentals',
    color: 'orange'
  },
  {
    id: 'singularity',
    address: '0x1003',
    name: 'Singularity',
    category: 'philosophy',
    description: 'A point of infinite density where all becomes one',
    longDescription: 'The Singularity represents the ultimate unity - where all distinctions collapse into a single point of infinite potential. It is both the beginning and the end, the source and the destination.',
    relatedConcepts: ['null-core', 'emergence', 'multiplicity'],
    color: 'pink'
  },
  {
    id: 'emergence',
    address: '0x1004',
    name: 'Emergence',
    category: 'philosophy',
    description: 'Complex patterns arising from simple interactions',
    longDescription: 'Emergence describes how complex systems and patterns arise from relatively simple interactions. The whole becomes greater than the sum of its parts.',
    relatedConcepts: ['singularity', 'multiplicity', 'evolution'],
    color: 'emerald'
  },
  {
    id: 'multiplicity',
    address: '0x1005',
    name: 'Multiplicity',
    category: 'philosophy',
    description: 'The state of being many from one',
    longDescription: 'Multiplicity represents diversity and differentiation - how unity becomes many, how potential becomes actual, how the simple becomes complex.',
    relatedConcepts: ['singularity', 'emergence'],
    color: 'violet'
  },
  
  // Algorithm Concepts
  {
    id: 'recursion',
    address: '0x2000',
    name: 'Recursion',
    category: 'algorithms',
    description: 'A function that calls itself to solve smaller instances',
    longDescription: 'Recursion is a programming technique where a function calls itself with modified parameters to solve progressively smaller instances of the same problem until reaching a base case.',
    relatedConcepts: ['decomposition', 'algorithm-design'],
    color: 'red'
  },
  {
    id: 'decomposition',
    address: '0x2001',
    name: 'Decomposition',
    category: 'algorithms',
    description: 'Breaking complex problems into smaller parts',
    longDescription: 'Decomposition is the process of breaking down complex problems into smaller, more manageable sub-problems that can be solved independently and combined for the final solution.',
    relatedConcepts: ['recursion', 'abstraction'],
    color: 'yellow'
  },
  {
    id: 'abstraction',
    address: '0x2002',
    name: 'Abstraction',
    category: 'algorithms',
    description: 'Focusing on essential details while hiding complexity',
    longDescription: 'Abstraction involves identifying and focusing on the essential characteristics of a problem while ignoring irrelevant details. It allows us to manage complexity by creating simplified models.',
    relatedConcepts: ['decomposition', 'pattern-recognition'],
    color: 'teal'
  },
  
  // Data Structure Concepts
  {
    id: 'arrays',
    address: '0x3000',
    name: 'Arrays',
    category: 'data',
    description: 'Ordered collections of elements',
    longDescription: 'Arrays are fundamental data structures that store elements in contiguous memory locations, allowing for efficient random access using indices.',
    relatedConcepts: ['linked-lists', 'stacks-queues'],
    color: 'blue'
  },
  {
    id: 'linked-lists',
    address: '0x3001',
    name: 'Linked Lists',
    category: 'data',
    description: 'Dynamic chains of connected nodes',
    longDescription: 'Linked lists are linear data structures where elements are stored in nodes, with each node containing data and a reference to the next node in the sequence.',
    relatedConcepts: ['arrays', 'stacks-queues'],
    color: 'green'
  },
  {
    id: 'trees',
    address: '0x3002',
    name: 'Trees',
    category: 'data',
    description: 'Hierarchical structures with parent-child relationships',
    longDescription: 'Trees are hierarchical data structures consisting of nodes connected by edges, with a single root node and each node having zero or more child nodes.',
    relatedConcepts: ['graphs', 'recursion'],
    color: 'amber'
  },
  {
    id: 'graphs',
    address: '0x3003',
    name: 'Graphs',
    category: 'data',
    description: 'Networks of interconnected nodes',
    longDescription: 'Graphs are non-linear data structures consisting of vertices (nodes) and edges (connections) that can represent complex relationships and networks.',
    relatedConcepts: ['trees', 'traversal'],
    color: 'purple'
  }
]

// Get only unlocked concepts
export function getUnlockedConcepts(): ConceptData[] {
  if (typeof window === 'undefined') return []
  
  const unlocked = JSON.parse(localStorage.getItem('unlockedConcepts') || '[]')
  return allConcepts.filter(concept => unlocked.includes(concept.id))
}

// Unlock a concept
export function unlockConcept(conceptId: string): void {
  if (typeof window === 'undefined') return
  
  const unlocked = JSON.parse(localStorage.getItem('unlockedConcepts') || '[]')
  if (!unlocked.includes(conceptId)) {
    unlocked.push(conceptId)
    localStorage.setItem('unlockedConcepts', JSON.stringify(unlocked))
  }
}

// Check if concept is unlocked
export function isConceptUnlocked(conceptId: string): boolean {
  if (typeof window === 'undefined') return false
  
  const unlocked = JSON.parse(localStorage.getItem('unlockedConcepts') || '[]')
  return unlocked.includes(conceptId)
}

// Get concept by ID
export function getConceptById(conceptId: string): ConceptData | undefined {
  return allConcepts.find(c => c.id === conceptId)
}

// Get related concepts
export function getRelatedConcepts(conceptId: string): ConceptData[] {
  const concept = getConceptById(conceptId)
  if (!concept?.relatedConcepts) return []
  
  return concept.relatedConcepts
    .map(id => getConceptById(id))
    .filter((c): c is ConceptData => c !== undefined)
}