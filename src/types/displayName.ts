export interface DisplayNameValidation {
  isValid: boolean
  isAvailable: boolean
  isChecking: boolean
  message: string
  suggestions: string[]
  type: 'success' | 'error' | 'warning' | 'info'
}

export interface DisplayNameMetadata {
  name: string
  discriminator: number // Like Discord: The Architect#0001
  fullName: string // "The Architect#0001"
  normalizedName: string // "the_architect" for uniqueness checking
  createdAt: Date
  lastModified: Date
}

export interface DisplayNameConflictResolution {
  original: string
  suggested: string[]
  reasons: string[]
  strategy: 'discriminator' | 'variation' | 'cosmic_suffix' | 'error'
}

// Cosmic-themed suffixes for name variations
export const COSMIC_SUFFIXES = [
  'Prime', 'Nova', 'Void', 'Star', 'Cosmic', 'Stellar', 'Nebula', 'Quantum',
  'Aurora', 'Genesis', 'Alpha', 'Omega', 'Eclipse', 'Infinity', 'Singularity',
  'Ethereal', 'Astral', 'Celestial', 'Galactic', 'Universal', 'Dimensional',
  'Temporal', 'Eternal', 'Radiant', 'Luminous', 'Prismatic', 'Crystalline'
] as const

// Cosmic-themed prefixes
export const COSMIC_PREFIXES = [
  'The', 'Lord', 'Lady', 'Master', 'Ancient', 'Elder', 'Prime', 'Grand',
  'Supreme', 'Eternal', 'Infinite', 'Cosmic', 'Stellar', 'Quantum', 'Void',
  'Shadow', 'Light', 'Dark', 'Bright', 'Pure', 'True', 'First', 'Last'
] as const

// Reserved names that cannot be taken
export const RESERVED_NAMES = [
  'admin', 'administrator', 'mod', 'moderator', 'obelisk', 'system', 'bot',
  'ai', 'errata', 'mnemonic', 'echelon', 'lagom', 'the_witness', 'witness',
  'support', 'help', 'official', 'staff', 'team', 'null', 'undefined'
] as const

// Validation rules
export const DISPLAY_NAME_RULES = {
  minLength: 2,
  maxLength: 32,
  allowedCharacters: /^[a-zA-Z0-9\s\-_.']+$/,
  forbiddenPatterns: [
    /^\d+$/, // All numbers
    /^[^a-zA-Z]*$/, // No letters
    /(.)\1{4,}/, // More than 4 consecutive identical characters
    /(fuck|shit|damn|hell|bitch|ass|sex|porn|xxx)/i, // Basic profanity filter
    /(discord|twitter|facebook|instagram|tiktok|youtube)/i, // Platform names
    /(admin|mod|staff|official|system|bot)/i // Role names
  ],
  maxConsecutiveSpaces: 2,
  maxConsecutiveSpecialChars: 3
} as const

export type DisplayNameStatus = 
  | 'available'
  | 'taken'
  | 'invalid'
  | 'reserved'
  | 'checking'
  | 'suggested'