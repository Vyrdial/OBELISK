export interface ConceptDefinition {
  id: string
  term: string
  definition: string
  notes: string[]
  demo?: {
    type: 'interactive' | 'visualization' | 'simulation'
    component: string
  }
  relatedConcepts?: string[]
}

export const conceptArchive: ConceptDefinition[] = [
  {
    id: 'binary-states',
    term: 'Binary States',
    definition: 'The fundamental duality of existence expressed through opposing yet complementary states: on/off, true/false, 0/1.',
    notes: [
      'Binary states form the foundation of digital computation',
      'Every complex system emerges from simple binary choices',
      'The power lies not in the states themselves, but in their combinations',
      'True and False are not enemies but dance partners in the ballet of logic'
    ],
    demo: {
      type: 'interactive',
      component: 'BinaryStatesDemo'
    },
    relatedConcepts: ['logic-gates', 'truth-tables', 'boolean-logic']
  },
  {
    id: 'logic-gates',
    term: 'Logic Gates',
    definition: 'The fundamental building blocks that process binary information, transforming inputs into outputs through logical operations.',
    notes: [
      'AND gates require all inputs to be true',
      'OR gates need only one input to be true',
      'NOT gates invert the input signal',
      'Complex circuits emerge from simple gate combinations'
    ],
    demo: {
      type: 'interactive',
      component: 'LogicGatesDemo'
    },
    relatedConcepts: ['binary-states', 'truth-tables', 'circuits']
  },
  {
    id: 'truth-tables',
    term: 'State Tables',
    definition: 'Systematic representations of all possible input-output relationships in logical operations.',
    notes: [
      'State tables reveal the complete behavior of logical systems',
      'They map every possible state to its outcome',
      'Patterns in state tables reveal the nature of logical operations',
      'Understanding state tables is understanding deterministic systems'
    ],
    demo: {
      type: 'visualization',
      component: 'StateTablesDemo'
    },
    relatedConcepts: ['binary-states', 'logic-gates', 'boolean-logic']
  },
  {
    id: 'singularity',
    term: 'Singularity',
    definition: 'The irreducible point of absolute unity where all distinctions collapse into one undifferentiated whole.',
    notes: [
      'The singularity represents the ultimate convergence of all possibilities',
      'It is both the origin and destination of all existence',
      'In mathematics, it manifests as the point where functions become undefined',
      'In consciousness, it is the moment of pure awareness without object'
    ],
    demo: {
      type: 'interactive',
      component: 'SingularityDemo'
    },
    relatedConcepts: ['nullity', 'unity', 'origin']
  },
  {
    id: 'nullity',
    term: 'Nullity',
    definition: 'The primordial void that precedes all existence; the absence that makes presence possible.',
    notes: [
      'Nullity is not mere emptiness but the fertile ground of potential',
      'It represents the space between thoughts, the pause between breaths',
      'In systems, it is the necessary reset that allows for new emergence',
      'The null core teaching: at the center of everything lies nothing'
    ],
    demo: {
      type: 'interactive',
      component: 'NullityDemo'
    },
    relatedConcepts: ['singularity', 'void', 'potential']
  },
  {
    id: 'multiplicity',
    term: 'Multiplicity',
    definition: 'The fundamental principle that reality expresses itself through infinite variations and manifestations.',
    notes: [
      'Multiplicity arises from singularity through the process of differentiation',
      'It is the one becoming many while remaining one',
      'Each instance contains the whole while being unique',
      'The paradox: diversity strengthens unity rather than fragmenting it'
    ],
    demo: {
      type: 'visualization',
      component: 'MultiplicityDemo'
    },
    relatedConcepts: ['singularity', 'diversity', 'emergence']
  },
  {
    id: 'traversal',
    term: 'Traversal',
    definition: 'The act of moving through dimensions of experience, connecting disparate points in the space of possibility.',
    notes: [
      'Traversal is not mere movement but conscious navigation',
      'Each path taken creates the territory it explores',
      'In learning, it is the journey that transforms the traveler',
      'The shortest distance between two points is understanding'
    ],
    demo: {
      type: 'interactive',
      component: 'TraversalDemo'
    },
    relatedConcepts: ['movement', 'path', 'journey']
  },
  {
    id: 'repulsion',
    term: 'Repulsion',
    definition: 'The force that maintains distinction and prevents collapse into undifferentiated unity.',
    notes: [
      'Repulsion creates the space necessary for relationship',
      'It is not rejection but the establishment of healthy boundaries',
      'In systems, it prevents stagnation and enables dynamic equilibrium',
      'The dance between attraction and repulsion creates all structure'
    ],
    demo: {
      type: 'simulation',
      component: 'RepulsionDemo'
    },
    relatedConcepts: ['attraction', 'force', 'boundary']
  },
  {
    id: 'attraction',
    term: 'Attraction',
    definition: 'The fundamental force that draws elements together, creating bonds and relationships across all scales of existence.',
    notes: [
      'Attraction is the universe recognizing itself in apparent otherness',
      'It operates through resonance and complementarity',
      'Too much attraction leads to collapse; too little leads to isolation',
      'Love is attraction conscious of itself'
    ],
    demo: {
      type: 'simulation',
      component: 'AttractionDemo'
    },
    relatedConcepts: ['repulsion', 'force', 'connection']
  },
  {
    id: 'combination',
    term: 'Combination',
    definition: 'The creative act of bringing elements together to form new wholes that transcend their parts.',
    notes: [
      'Combination is not mere addition but transformation',
      'The whole emerges with properties impossible to predict from the parts',
      'In consciousness, it is the synthesis that creates new understanding',
      'Every combination changes both the combined and the combiner'
    ],
    demo: {
      type: 'interactive',
      component: 'CombinationDemo'
    },
    relatedConcepts: ['synthesis', 'emergence', 'creation']
  },
  {
    id: 'contradiction',
    term: 'Contradiction',
    definition: 'The simultaneous truth of opposing realities that reveals the limitations of linear thinking.',
    notes: [
      'Contradiction is not error but invitation to deeper understanding',
      'It marks the boundaries where one framework meets another',
      'In growth, we must embrace contradiction to transcend it',
      'The resolution of contradiction births new dimensions of thought'
    ],
    demo: {
      type: 'visualization',
      component: 'ContradictionDemo'
    },
    relatedConcepts: ['paradox', 'dialectic', 'resolution']
  },
  {
    id: 'evolution',
    term: 'Evolution',
    definition: 'The eternal unfolding of potential into actuality through cycles of transformation and transcendence.',
    notes: [
      'Evolution is not progress but deepening complexity',
      'Each stage includes and transcends what came before',
      'It operates through variation, selection, and integration',
      'Consciousness evolves by evolving its own evolution'
    ],
    demo: {
      type: 'simulation',
      component: 'EvolutionDemo'
    },
    relatedConcepts: ['change', 'growth', 'transformation']
  },
  {
    id: 'separation',
    term: 'Separation',
    definition: 'The necessary illusion that creates distinction, enabling relationship and the play of consciousness with itself.',
    notes: [
      'Separation is the first movement from unity to multiplicity',
      'It creates the space in which love can exist',
      'All learning requires the separation of known from unknown',
      'The journey home begins with leaving'
    ],
    demo: {
      type: 'interactive',
      component: 'SeparationDemo'
    },
    relatedConcepts: ['unity', 'distinction', 'relationship']
  },
  {
    id: 'reversal',
    term: 'Reversal',
    definition: 'The principle that every movement contains its opposite and that extremes transform into their complement.',
    notes: [
      'Reversal reveals the circular nature of linear progression',
      'At the peak of any quality lies the seed of its opposite',
      'In practice, it is the art of finding strength in weakness',
      'The wise learn to reverse before being reversed'
    ],
    demo: {
      type: 'interactive',
      component: 'ReversalDemo'
    },
    relatedConcepts: ['transformation', 'cycle', 'balance']
  },
  {
    id: 'emergence',
    term: 'Emergence',
    definition: 'The spontaneous arising of new properties and patterns from the interaction of simpler elements.',
    notes: [
      'Emergence cannot be predicted, only recognized',
      'It is the universe surprising itself',
      'Consciousness itself is the ultimate emergent property',
      'To facilitate emergence, create conditions, not outcomes'
    ],
    demo: {
      type: 'simulation',
      component: 'EmergenceDemo'
    },
    relatedConcepts: ['complexity', 'novelty', 'creation']
  },
  {
    id: 'contact',
    term: 'Contact',
    definition: 'The moment of meeting where boundaries touch and exchange becomes possible.',
    notes: [
      'Contact is the prerequisite for all transformation',
      'It requires both approach and receptivity',
      'True contact changes both parties',
      'The quality of contact determines the quality of connection'
    ],
    demo: {
      type: 'interactive',
      component: 'ContactDemo'
    },
    relatedConcepts: ['connection', 'boundary', 'exchange']
  },
  {
    id: 'inversion',
    term: 'Inversion',
    definition: 'The operation of turning inside-out or upside-down to reveal hidden structures and relationships.',
    notes: [
      'Inversion is a tool for seeing familiar things anew',
      'Often, the solution is the problem inverted',
      'In consciousness, it is looking at the looker',
      'Every perspective has an inverse equally valid'
    ],
    demo: {
      type: 'visualization',
      component: 'InversionDemo'
    },
    relatedConcepts: ['reversal', 'perspective', 'transformation']
  },
  {
    id: 'orbit',
    term: 'Orbit',
    definition: 'The dynamic balance between attraction and momentum that creates stable patterns of relationship.',
    notes: [
      'Orbit demonstrates how opposition creates stability',
      'It is neither approach nor escape but dynamic equilibrium',
      'In relationships, we orbit what we cannot possess or abandon',
      'Every orbit is a negotiation between freedom and connection'
    ],
    demo: {
      type: 'simulation',
      component: 'OrbitDemo'
    },
    relatedConcepts: ['balance', 'cycle', 'relationship']
  },
  {
    id: 'communicate',
    term: 'Communicate',
    definition: 'The sacred act of making common what was separate, bridging consciousness across the void.',
    notes: [
      'Communication is communion through symbol and silence',
      'It requires both transmission and reception',
      'Perfect communication would end the need for communication',
      'We communicate most clearly when we listen'
    ],
    demo: {
      type: 'interactive',
      component: 'CommunicateDemo'
    },
    relatedConcepts: ['connection', 'expression', 'understanding']
  },
  {
    id: 'discovery',
    term: 'Discovery',
    definition: 'The act of unveiling what was always present but hidden from awareness.',
    notes: [
      'Discovery is recognition, not creation',
      'It requires both seeking and allowing',
      'Every discovery changes the discoverer',
      'The greatest discoveries are of what we already knew'
    ],
    demo: {
      type: 'interactive',
      component: 'DiscoveryDemo'
    },
    relatedConcepts: ['revelation', 'awareness', 'recognition']
  },
  {
    id: 'follow',
    term: 'Follow',
    definition: 'The wisdom of aligning with forces greater than oneself, finding power in surrender.',
    notes: [
      'To follow well is to lead from behind',
      'Following requires discrimination and trust',
      'In following the right path, we become the path',
      'The river follows gravity and carves the canyon'
    ],
    demo: {
      type: 'visualization',
      component: 'FollowDemo'
    },
    relatedConcepts: ['flow', 'alignment', 'trust']
  },
  {
    id: 'target',
    term: 'Target',
    definition: 'The focal point that organizes attention and action, giving direction to energy.',
    notes: [
      'The target shapes the archer as much as the arrow',
      'In aiming for one thing, we become it',
      'The truest target is often invisible',
      'Missing the target teaches more than hitting it'
    ],
    demo: {
      type: 'interactive',
      component: 'TargetDemo'
    },
    relatedConcepts: ['focus', 'intention', 'aim']
  },
  {
    id: 'attend',
    term: 'Attend',
    definition: 'The act of bringing conscious presence to bear upon experience, illuminating through awareness.',
    notes: [
      'Attention is the currency of consciousness',
      'What we attend to grows in significance and power',
      'Sustained attention transforms both observer and observed',
      'The quality of attention determines the quality of experience'
    ],
    demo: {
      type: 'interactive',
      component: 'AttendDemo'
    },
    relatedConcepts: ['awareness', 'presence', 'focus']
  },
  {
    id: 'hold',
    term: 'Hold',
    definition: 'The capacity to maintain without grasping, to contain without constraining.',
    notes: [
      'Holding requires strength and softness in equal measure',
      'We must hold loosely what we wish to keep',
      'In consciousness, it is maintaining awareness without fixation',
      'The universe holds us as we hold our breath'
    ],
    demo: {
      type: 'interactive',
      component: 'HoldDemo'
    },
    relatedConcepts: ['contain', 'maintain', 'support']
  },
  {
    id: 'extend',
    term: 'Extend',
    definition: 'The movement beyond current boundaries into new territories of being and knowing.',
    notes: [
      'Extension is growth through reaching',
      'We extend by including more within our circle of care',
      'Every extension requires a stable base',
      'To extend fully is to touch infinity'
    ],
    demo: {
      type: 'visualization',
      component: 'ExtendDemo'
    },
    relatedConcepts: ['reach', 'growth', 'expansion']
  },
  {
    id: 'submerge',
    term: 'Submerge',
    definition: 'The descent into depths where surface distinctions dissolve and deeper currents are revealed.',
    notes: [
      'Submergence is voluntary dissolution for the sake of renewal',
      'In the depths, we find what the surface cannot show',
      'To submerge is to trust the return',
      'Every emergence requires a prior submergence'
    ],
    demo: {
      type: 'interactive',
      component: 'SubmergeDemo'
    },
    relatedConcepts: ['depth', 'dissolution', 'immersion']
  },
  {
    id: 'name',
    term: 'Name',
    definition: 'The power to distinguish and call forth, creating identity through the act of recognition.',
    notes: [
      'To name is to separate from the unnamed',
      'Names have power to invoke and evoke',
      'The true name of a thing contains its essence',
      'In naming others, we name ourselves'
    ],
    demo: {
      type: 'interactive',
      component: 'NameDemo'
    },
    relatedConcepts: ['identity', 'recognition', 'distinction']
  },
  {
    id: 'generate',
    term: 'Generate',
    definition: 'The creative force that brings forth new forms from the interaction of existing patterns.',
    notes: [
      'Generation is creation through combination and transformation',
      'Every moment generates the next',
      'To generate is to participate in the universe creating itself',
      'The generator is transformed by what it generates'
    ],
    demo: {
      type: 'simulation',
      component: 'GenerateDemo'
    },
    relatedConcepts: ['create', 'produce', 'birth']
  },
  {
    id: 'sequence',
    term: 'Sequence',
    definition: 'The ordered unfolding of events that creates meaning through relationship in time.',
    notes: [
      'Sequence creates story from isolated moments',
      'The meaning of each element depends on what comes before and after',
      'In consciousness, sequence is the thread of continuity',
      'To understand sequence is to perceive the music in the notes'
    ],
    demo: {
      type: 'interactive',
      component: 'SequenceDemo'
    },
    relatedConcepts: ['order', 'time', 'pattern']
  },
  {
    id: 'stasis',
    term: 'Stasis',
    definition: 'The dynamic equilibrium that appears motionless while containing all potential for movement.',
    notes: [
      'Stasis is not stagnation but poised readiness',
      'In the stillness, all movements are present',
      'It is the pause between breaths where transformation occurs',
      'True stasis is achieved through perfect balance of forces'
    ],
    demo: {
      type: 'visualization',
      component: 'StasisDemo'
    },
    relatedConcepts: ['equilibrium', 'balance', 'stillness']
  },
  {
    id: 'axis',
    term: 'Axis',
    definition: 'The invisible line around which rotation occurs, the stable center that enables movement.',
    notes: [
      'Every transformation requires an unchanging axis',
      'The axis is known only through what revolves around it',
      'In consciousness, it is the witness that remains while all else changes',
      'To find your axis is to discover your center'
    ],
    demo: {
      type: 'interactive',
      component: 'AxisDemo'
    },
    relatedConcepts: ['center', 'rotation', 'stability']
  },
  {
    id: 'change',
    term: 'Change',
    definition: 'The only constant; the continuous transformation that is the signature of existence.',
    notes: [
      'Change is not loss but revelation of new forms',
      'Resistance to change creates suffering; alignment with it creates flow',
      'Every change preserves something essential while releasing the rest',
      'To master change is to change at the rate of change'
    ],
    demo: {
      type: 'simulation',
      component: 'ChangeDemo'
    },
    relatedConcepts: ['transformation', 'flow', 'evolution']
  },
  {
    id: 'identity',
    term: 'Identity',
    definition: 'The persistent pattern that maintains coherence through all transformations.',
    notes: [
      'Identity is not fixed but dynamically maintained',
      'It emerges from the relationship between change and continuity',
      'True identity includes all of its changes',
      'We are not what we are but what we are becoming'
    ],
    demo: {
      type: 'interactive',
      component: 'IdentityDemo'
    },
    relatedConcepts: ['self', 'continuity', 'essence']
  },
  {
    id: 'impose',
    term: 'Impose',
    definition: 'The application of will upon reality, the necessary violence of making space for the new.',
    notes: [
      'Imposition is creation through displacement',
      'Every act of creation imposes form upon formlessness',
      'The art is knowing when imposition serves and when it destroys',
      'We impose most effectively when aligned with natural patterns'
    ],
    demo: {
      type: 'interactive',
      component: 'ImposeDemo'
    },
    relatedConcepts: ['will', 'force', 'creation']
  }
]