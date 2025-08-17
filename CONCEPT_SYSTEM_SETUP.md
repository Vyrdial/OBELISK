# Concept System Setup Guide

## Overview
The concept system allows users to unlock educational concepts as they progress through lessons. Concepts are stored in Supabase for persistence across devices and sessions.

## Database Setup

### 1. Run the SQL Migration
Execute the following SQL file in your Supabase SQL Editor:
```bash
create_unlocked_concepts_table.sql
```

This will:
- Create the `unlocked_concepts` table
- Set up Row Level Security (RLS) policies
- Create helper functions for managing concepts
- Add indexes for performance

### 2. Features Implemented

#### API Routes
- `/api/concepts/unlock` - Unlock a concept (POST) or get all unlocked concepts (GET)
- `/api/concepts/check` - Check if a specific concept is unlocked (POST)

#### Hooks
- `useUnlockedConcepts()` - React hook for managing concept state

#### Components Enhanced
- **LearningNotebook** - Now shows concepts with lock/unlock status
- **Archive Page** - Displays only unlocked concepts from Supabase
- **Lessons** - Automatically unlock concepts when completing sections

## How It Works

### 1. Concept Unlocking
When a user completes a lesson section that introduces a concept:
```javascript
const { unlockConcept } = useUnlockedConcepts()
await unlockConcept('binary-states')
```

### 2. Checking Unlock Status
The system checks both Supabase and localStorage:
- Authenticated users: Syncs with Supabase
- Non-authenticated users: Uses localStorage fallback

### 3. Viewing Concepts
- Unlocked concepts appear in the Archive
- Clicking a concept opens its dedicated page at `/archive/[concept-id]`
- The LearningNotebook shows concept entries with visual unlock status

## Concept IDs Currently Used
- `binary-states` - Binary States concept
- `logic-gates` - Logic Gates concept  
- `truth-tables` - Truth Tables concept

## Adding New Concepts

1. Add concept data to `/lib/conceptsData.ts`
2. Create a demo component in `/components/archive/demos/`
3. Update the concept archive in `/lib/conceptArchive.ts`
4. Unlock the concept in relevant lessons using `unlockConcept()`

## Testing

1. Complete a lesson that unlocks concepts
2. Check the Archive to see unlocked concepts
3. Open the LearningNotebook to view concept entries
4. Click on unlocked concepts to view their detail pages

## Fallback Behavior
If Supabase is unavailable, the system falls back to localStorage to ensure concepts remain accessible offline.