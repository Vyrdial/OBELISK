import { DictionaryEntry } from '@/types/dictionary'

const DICTIONARY_STORAGE_KEY = 'obelisk_personal_dictionary'

export const dictionaryService = {
  // Get all dictionary entries
  getEntries(): DictionaryEntry[] {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(DICTIONARY_STORAGE_KEY)
    if (!stored) return []
    
    try {
      const data = JSON.parse(stored)
      return data.entries || []
    } catch {
      return []
    }
  },

  // Add a new entry
  addEntry(entry: Omit<DictionaryEntry, 'unlockedAt'>): void {
    const entries = this.getEntries()
    
    // Check if entry already exists
    if (entries.some(e => e.id === entry.id)) {
      return
    }
    
    const newEntry: DictionaryEntry = {
      ...entry,
      unlockedAt: new Date()
    }
    
    entries.push(newEntry)
    this.saveEntries(entries)
  },

  // Save entries to localStorage
  saveEntries(entries: DictionaryEntry[]): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify({
      entries,
      lastUpdated: new Date()
    }))
  },

  // Search entries
  searchEntries(query: string): DictionaryEntry[] {
    const entries = this.getEntries()
    const lowerQuery = query.toLowerCase()
    
    return entries.filter(entry => 
      entry.term.toLowerCase().includes(lowerQuery) ||
      entry.definition.toLowerCase().includes(lowerQuery) ||
      entry.detailedExplanation.toLowerCase().includes(lowerQuery) ||
      entry.relatedConcepts?.some(concept => concept.toLowerCase().includes(lowerQuery))
    )
  },

  // Get entry by ID
  getEntryById(id: string): DictionaryEntry | null {
    const entries = this.getEntries()
    return entries.find(e => e.id === id) || null
  }
}

// Pre-defined entries for concepts we know about
export const predefinedEntries: Record<string, Omit<DictionaryEntry, 'unlockedAt'>> = {
  'null-core': {
    id: 'null-core',
    term: 'Null Core',
    definition: 'A zero dimensional position.',
    detailedExplanation: `A null core is a zero dimensional position - the fundamental unit of mathematics. While we use dots or points to mark where null cores exist, the null core itself is invisible.

In traditional science, this concept is often called a "singularity" - but "null core" is clearer because it emphasizes the zero-dimensional nature of the position.

Key characteristics:
• Zero dimensional (0D)
• Has position but no size
• No width, height, or depth  
• Cannot be directly observed
• We mark them with dots

Think of it as pure location without any extent. A 1D line has length, a 2D surface has area, a 3D object has volume - but a 0D null core has only position.

The dimensional incompatibility explains why you can never "reach" a null core with anything that has size - you can't have a 1D/2D arrow touch a 0D point.`,
    lessonId: 'null-core',
    relatedConcepts: ['point', 'position', 'marker', 'extent', 'singularity'],
    examples: [
      'Every dot you see in mathematics is a marker for an invisible null core',
      'The center of a circle is a null core - it has position but no size',
      'Coordinate points like (3, 4) represent null cores at those positions'
    ],
    interactiveDemo: {
      type: 'visualization',
      component: 'NullCoreDemo'
    }
  },
  'axis': {
    id: 'axis',
    term: 'Axis',
    definition: 'A way something can change or move. Each axis is independent.',
    detailedExplanation: `An axis represents an independent way that something can vary, change, or move. The key insight is that each axis must be completely separate from all others.

Spatial axes:
• 1-axis: Movement along a line (left-right)
• 2-axis: Movement on a plane (left-right AND up-down)
• 3-axis: Movement in space (left-right AND up-down AND forward-backward)

Independence requirement:
For something to be a true axis, changing it must not automatically change any other axis. This is why left-right movement is independent of up-down movement - you can move left without moving up.

Beyond space:
Axes aren't limited to physical space. In music, volume and pitch are axes - you can change one without affecting the other. In data, any independent variable represents an axis.

Visualization paradox:
We often need higher-axis spaces to show lower-axis ones. For example, we use our 2-axis screen to show 1-axis movement along a line. This is because we need the extra axes to make the lower-axis movement visible.

The power of axes:
Understanding axes is fundamental to mathematics, physics, and data analysis. Every measurement, every coordinate, every way of describing change relies on axis thinking.`,
    lessonId: 'axes',
    relatedConcepts: ['independence', 'orthogonal', 'movement', 'space', 'axes', 'coordinates'],
    examples: [
      'A slider moves in one axis - left to right',
      'A mouse cursor moves in two axes on your screen',
      'A drone moves in three axes through space',
      'Volume and pitch are axes in music'
    ],
    interactiveDemo: {
      type: 'visualization',
      component: 'DimensionDemo'
    }
  },
  'orthogonal': {
    id: 'orthogonal',
    term: 'Orthogonal',
    definition: 'Completely independent. When two things are orthogonal, changing one does not affect the other.',
    detailedExplanation: `Orthogonal is a precise way to describe complete independence between axes, directions, or concepts. When two things are orthogonal, they have no influence on each other whatsoever.

In axisal terms:
• Moving left-right is orthogonal to moving up-down
• Moving forward-backward is orthogonal to both left-right and up-down
• Each axis must be orthogonal to all others

Why this matters:
The requirement for orthogonality ensures that axes represent truly separate ways to vary. Without orthogonality, you wouldn't have distinct axes - just different combinations of the same underlying variations.

Mathematical precision:
In mathematics, orthogonal specifically means "at right angles" (90 degrees), but the deeper concept is about independence. Two vectors are orthogonal when their dot product equals zero, meaning they share no common direction.

Real-world examples:
• Volume and pitch in music are orthogonal - you can change one without affecting the other
• Temperature and pressure in some systems can be orthogonal
• In data analysis, orthogonal features don't correlate with each other`,
    lessonId: 'axes',
    relatedConcepts: ['independence', 'axes', 'perpendicular', 'right-angle', 'axes'],
    examples: [
      'Up-down movement is orthogonal to left-right movement',
      'In a coordinate system, the X and Y axes are orthogonal',
      'Brightness and contrast on a monitor are often orthogonal controls',
      'Forward-backward is orthogonal to both left-right and up-down'
    ],
    interactiveDemo: {
      type: 'visualization',
      component: 'OrthogonalDemo'
    }
  },
  'origin': {
    id: 'origin',
    term: 'Origin',
    definition: 'A chosen reference point that becomes (0,0) in a coordinate system. Completely arbitrary.',
    detailedExplanation: `An origin is the reference point we designate as (0,0) in any coordinate system. The crucial insight is that choosing an origin is completely arbitrary - any point can serve as the origin.

Key characteristics:
• The origin is where we place (0,0) in our coordinate system
• All other positions are measured relative to this point
• Changing the origin changes all coordinates, but not the actual relationships
• No point in space is inherently more "central" than any other

Why origins matter:
Origins are necessary for measurement and communication. Without agreeing on where (0,0) is, we can't give coordinates or directions. But the choice itself is just a convenience.

Real-world examples:
• Maps use different origins (equator/prime meridian, city centers, etc.)
• Computer screens put (0,0) at the top-left corner
• GPS coordinates use Earth's center as origin
• Each coordinate system can have its own origin

Universal relativity insight:
Since any point can be the origin, there is no "true center" of space. Every position exists only in relation to other positions. The universe has no absolute coordinate system - we create them for our convenience.`,
    lessonId: 'universal-relativity',
    relatedConcepts: ['coordinates', 'reference point', 'relativity', 'measurement', 'arbitrary choice'],
    examples: [
      'In a map, the origin might be the city center',
      'On a graph, we often put the origin at the intersection of axes',
      'In GPS, the origin is Earth\'s center',
      'You can make any null core the origin of your coordinate system'
    ],
    interactiveDemo: {
      type: 'visualization',
      component: 'OriginDemo'
    }
  },
  'interval': {
    id: 'interval',
    term: 'Interval',
    definition: 'The distance chosen to represent "1 unit" in a coordinate system. This choice is arbitrary.',
    detailedExplanation: `An interval defines what distance equals "1 unit" in our coordinate system. Like choosing an origin, this is completely arbitrary - we decide what length represents our unit of measurement.

Key characteristics:
• Determines the scale of our coordinate system
• Can be any distance we choose as our reference
• Changing the interval rescales all measurements proportionally
• No distance is inherently more "natural" as a unit than any other

Why intervals matter:
Without defining what "1 unit" means, coordinates become meaningless. If I say something is at position (3, 4), you need to know what distance equals 1 to understand where that actually is.

Measurement standards:
• Meters, feet, inches are all interval choices
• In coordinate systems, we often use the distance between two specific points
• Computer graphics use pixels as intervals
• Maps use different scales (1 inch = 1 mile, etc.)

Arbitrary nature:
There's no "correct" interval in the universe. We could measure everything in:
• The distance between two null cores
• The length of a particular object
• Any convenient reference distance

The relationships between objects remain the same regardless of what interval we choose - only our numerical descriptions change.`,
    lessonId: 'universal-relativity',
    relatedConcepts: ['measurement', 'scale', 'units', 'distance', 'coordinate system', 'arbitrary choice'],
    examples: [
      'Using the distance between two cities as "1 unit"',
      'Measuring everything in terms of a standard ruler',
      'Computer pixels as units on a screen',
      'The distance between specific null cores as our interval'
    ],
    interactiveDemo: {
      type: 'visualization',
      component: 'IntervalDemo'
    }
  },
  'directional-indicators': {
    id: 'directional-indicators',
    term: 'Directional Indicators',
    definition: 'Symbols used to distinguish between opposite directions on an axis.',
    detailedExplanation: `Directional indicators are symbols we use to show which way we're moving along an axis. The key insight is that these symbols are just conventions - any pair of distinct symbols can work as long as everyone agrees on their meaning.

Common examples:
• + and − (positive and negative)
• → and ← (right and left arrows)
• R and L (right and left)
• > and < (greater and less than)
• ▶ and ◀ (filled arrows)

Important understanding:
The symbols + and − don't mean "addition" and "subtraction" in this context. They're simply labels to distinguish one direction from its opposite. We could use any pair of symbols - hearts and stars, A and B, or even colors.

Why we need them:
Without directional indicators, we can say "3 units away from the origin" but we can't specify which direction. The indicators let us distinguish between 3 units in one direction versus 3 units in the opposite direction.

Convention vs. reality:
• The choice of symbols is arbitrary
• What matters is consistency within a system
• Different fields use different conventions
• The underlying positions remain the same regardless of our symbols

This reveals a deep truth: direction itself is relative. There's no absolute "positive" or "negative" direction in the universe - we create these distinctions for communication and calculation.`,
    lessonId: 'space-fundamentals',
    relatedConcepts: ['direction', 'convention', 'symbols', 'positive', 'negative', 'arrows'],
    examples: [
      'Using + for right and − for left on a number line',
      'Arrows → and ← showing direction of movement',
      'North/South or East/West as directional pairs',
      'Red and blue colors to indicate opposite directions'
    ],
    interactiveDemo: {
      type: 'visualization',
      component: 'DirectionalIndicatorsDemo'
    }
  }
}