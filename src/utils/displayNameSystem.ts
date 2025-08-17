import { 
  DisplayNameValidation, 
  DisplayNameMetadata,
  DisplayNameConflictResolution,
  COSMIC_SUFFIXES,
  COSMIC_PREFIXES,
  RESERVED_NAMES,
  DISPLAY_NAME_RULES,
  DisplayNameStatus
} from '@/types/displayName'

export class DisplayNameSystem {
  // In-memory storage for demo - in production, this would be a database
  private static takenNames = new Set<string>([
    'the_architect', 'cosmic_forge', 'singularity_prime', 'void_walker',
    'stellar_genesis', 'the_ancient_one', 'reality_weaver', 'cosmic_architect',
    'the_first_light', 'obelisk_keeper', 'code_singularity', 'the_creator',
    'noah', 'john_doe', 'test_user', 'admin', 'moderator', 'cosmic_overlord',
    'star_lord', 'quantum_master', 'void_sage', 'nebula_walker'
  ])

  private static discriminatorMap = new Map<string, number>([
    ['the_architect', 1], ['cosmic_forge', 1], ['void_walker', 1]
  ])

  /**
   * Normalize display name for uniqueness checking
   */
  static normalizeDisplayName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  }

  /**
   * Validate display name format and rules
   */
  static validateFormat(name: string): { isValid: boolean; message: string; type: 'error' | 'success' } {
    const trimmed = name.trim()

    if (trimmed.length < DISPLAY_NAME_RULES.minLength) {
      return {
        isValid: false,
        message: `Name must be at least ${DISPLAY_NAME_RULES.minLength} characters long`,
        type: 'error'
      }
    }

    if (trimmed.length > DISPLAY_NAME_RULES.maxLength) {
      return {
        isValid: false,
        message: `Name must be no more than ${DISPLAY_NAME_RULES.maxLength} characters long`,
        type: 'error'
      }
    }

    if (!DISPLAY_NAME_RULES.allowedCharacters.test(trimmed)) {
      return {
        isValid: false,
        message: 'Name can only contain letters, numbers, spaces, hyphens, underscores, periods, and apostrophes',
        type: 'error'
      }
    }

    // Check forbidden patterns with specific messages
    const forbiddenChecks = [
      {
        pattern: /^\d+$/,
        message: 'Name cannot be only numbers'
      },
      {
        pattern: /^[^a-zA-Z]*$/,
        message: 'Name must contain at least one letter'
      },
      {
        pattern: /(.)\1{6,}/,
        message: 'Name cannot have more than 6 consecutive identical characters'
      },
      // Removed most profanity filters - let Claude AI handle this
      {
        pattern: /(admin|administrator|mod|moderator|staff|official|system|bot|support)$/i,
        message: 'Name cannot contain administrative or system terms'
      }
    ]

    for (const check of forbiddenChecks) {
      if (check.pattern.test(trimmed)) {
        return {
          isValid: false,
          message: check.message,
          type: 'error'
        }
      }
    }

    // Check consecutive spaces
    if (/ {3,}/.test(trimmed)) {
      return {
        isValid: false,
        message: 'Too many consecutive spaces',
        type: 'error'
      }
    }

    // Check for reserved names
    const normalized = this.normalizeDisplayName(trimmed)
    if (RESERVED_NAMES.includes(normalized as typeof RESERVED_NAMES[number])) {
      return {
        isValid: false,
        message: 'This name is reserved and cannot be used',
        type: 'error'
      }
    }

    return {
      isValid: true,
      message: 'Name format is valid',
      type: 'success'
    }
  }

  /**
   * Check if display name is available
   */
  static async checkAvailability(name: string): Promise<DisplayNameStatus> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const formatValidation = this.validateFormat(name)
    if (!formatValidation.isValid) {
      return 'invalid'
    }

    const normalized = this.normalizeDisplayName(name)
    
    if (RESERVED_NAMES.includes(normalized as typeof RESERVED_NAMES[number])) {
      return 'reserved'
    }

    if (this.takenNames.has(normalized)) {
      return 'taken'
    }

    return 'available'
  }

  /**
   * Generate cosmic-themed variations of a name
   */
  static generateCosmicVariations(originalName: string, count: number = 5): string[] {
    const variations = new Set<string>()
    const baseName = originalName.trim()

    // Strategy 1: Add cosmic suffixes
    for (const suffix of COSMIC_SUFFIXES) {
      if (variations.size >= count) break
      const variation = `${baseName} ${suffix}`
      const normalized = this.normalizeDisplayName(variation)
      if (!this.takenNames.has(normalized) && variation !== baseName) {
        variations.add(variation)
      }
    }

    // Strategy 2: Add cosmic prefixes
    for (const prefix of COSMIC_PREFIXES) {
      if (variations.size >= count) break
      const variation = `${prefix} ${baseName}`
      const normalized = this.normalizeDisplayName(variation)
      if (!this.takenNames.has(normalized) && variation !== baseName) {
        variations.add(variation)
      }
    }

    // Strategy 3: Combinations of prefix + name + suffix
    if (variations.size < count) {
      for (const prefix of COSMIC_PREFIXES.slice(0, 3)) {
        for (const suffix of COSMIC_SUFFIXES.slice(0, 3)) {
          if (variations.size >= count) break
          const variation = `${prefix} ${baseName} ${suffix}`
          const normalized = this.normalizeDisplayName(variation)
          if (!this.takenNames.has(normalized) && variation !== baseName) {
            variations.add(variation)
          }
        }
      }
    }

    // Strategy 4: Number variations (as last resort)
    if (variations.size < count) {
      for (let i = 2; i <= count + 5; i++) {
        if (variations.size >= count) break
        const variation = `${baseName} ${i}`
        const normalized = this.normalizeDisplayName(variation)
        if (!this.takenNames.has(normalized)) {
          variations.add(variation)
        }
      }
    }

    return Array.from(variations).slice(0, count)
  }

  /**
   * Generate discriminator-based name (Discord style)
   */
  static generateDiscriminatorName(baseName: string): DisplayNameMetadata {
    const normalized = this.normalizeDisplayName(baseName)
    let discriminator = this.discriminatorMap.get(normalized) || 0
    discriminator += 1
    
    this.discriminatorMap.set(normalized, discriminator)
    
    const fullName = `${baseName}#${discriminator.toString().padStart(4, '0')}`
    
    return {
      name: baseName,
      discriminator,
      fullName,
      normalizedName: normalized,
      createdAt: new Date(),
      lastModified: new Date()
    }
  }

  /**
   * Resolve naming conflicts with multiple strategies
   */
  static async resolveConflict(originalName: string): Promise<DisplayNameConflictResolution> {
    const status = await this.checkAvailability(originalName)
    
    if (status === 'available') {
      return {
        original: originalName,
        suggested: [],
        reasons: ['Name is available'],
        strategy: 'discriminator'
      }
    }

    const suggestions = this.generateCosmicVariations(originalName, 6)
    const reasons = []

    if (status === 'taken') {
      reasons.push('This identity is already claimed by another Singularity')
    } else if (status === 'reserved') {
      reasons.push('This name is reserved')
    } else if (status === 'invalid') {
      reasons.push('This name violates naming principles')
    }

    reasons.push('Consider these alternatives that resonate with your essence:')

    return {
      original: originalName,
      suggested: suggestions,
      reasons,
      strategy: suggestions.length > 0 ? 'cosmic_suffix' : 'discriminator'
    }
  }

  /**
   * Reserve a display name
   */
  static async reserveDisplayName(name: string): Promise<{
    success: boolean
    metadata?: DisplayNameMetadata
    message: string
  }> {
    const status = await this.checkAvailability(name)
    
    if (status !== 'available') {
      return {
        success: false,
        message: 'Name is not available for reservation'
      }
    }

    const normalized = this.normalizeDisplayName(name)
    this.takenNames.add(normalized)
    
    const metadata = this.generateDiscriminatorName(name)
    
    return {
      success: true,
      metadata,
      message: `Identity "${name}" has been reserved for you`
    }
  }

  /**
   * Comprehensive validation with real-time feedback
   */
  static async validateDisplayName(name: string): Promise<DisplayNameValidation> {
    if (!name || name.trim().length === 0) {
      return {
        isValid: false,
        isAvailable: false,
        isChecking: false,
        message: 'Your identity awaits...',
        suggestions: [],
        type: 'info'
      }
    }

    // Format validation first
    const formatCheck = this.validateFormat(name)
    if (!formatCheck.isValid) {
      const suggestions = this.generateCosmicVariations(name, 3)
      return {
        isValid: false,
        isAvailable: false,
        isChecking: false,
        message: formatCheck.message,
        suggestions,
        type: 'error'
      }
    }

    // Availability check
    const status = await this.checkAvailability(name)
    
    if (status === 'available') {
      return {
        isValid: true,
        isAvailable: true,
        isChecking: false,
        message: '✨ This identity is available and resonates with power!',
        suggestions: [],
        type: 'success'
      }
    }

    // Handle conflicts
    const resolution = await this.resolveConflict(name)
    
    const messages = {
      taken: '🌌 This identity is already claimed by another Singularity',
      reserved: '⚡ This name is reserved',
      invalid: '❌ This name violates naming principles'
    }

    return {
      isValid: false,
      isAvailable: false,
      isChecking: false,
      message: messages[status as keyof typeof messages] || 'Name is not available',
      suggestions: resolution.suggested,
      type: 'warning'
    }
  }

  /**
   * Get suggested names for inspiration
   */
  static getCosmicInspiration(): string[] {
    const inspirations = [
      'The Architect', 'Void Walker', 'Stellar Genesis', 'Cosmic Sage',
      'Quantum Dreamer', 'Nebula Weaver', 'Star Whisperer', 'Infinite Mind',
      'Celestial Seeker', 'Astral Navigator', 'Cosmic Scholar', 'Void Prophet',
      'Stellar Artificer', 'Quantum Oracle', 'Cosmic Wanderer', 'Star Forger',
      'Ethereal Guide', 'Dimensional Keeper', 'Cosmic Philosopher', 'Void Sage'
    ]

    return inspirations
      .sort(() => Math.random() - 0.5)
      .slice(0, 8)
      .filter(name => !this.takenNames.has(this.normalizeDisplayName(name)))
  }

  /**
   * Development helper: Add preset names for testing
   */
  static addPresetName(name: string): void {
    const normalized = this.normalizeDisplayName(name)
    this.takenNames.add(normalized)
  }

  /**
   * Development helper: Check if name is taken
   */
  static isNameTaken(name: string): boolean {
    const normalized = this.normalizeDisplayName(name)
    return this.takenNames.has(normalized)
  }
}