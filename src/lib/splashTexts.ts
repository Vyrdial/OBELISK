// Splash text pool for loading screens and cosmic moments
export const splashTexts = [
  // Original cosmic messages
  "Traversing the cosmos...",
  "Aligning singularities...",
  "Gathering stardust...",
  "Mapping constellations...",
  "Synchronizing with the void...",
  "Calibrating cosmic frequencies...",
  "Harmonizing quantum states...",
  
  // Wise ass philosophical gems
  "There are no hard problems, only messy framings",
  "The universe is not complicated, your categories are",
  "Clarity is just confusion that gave up",
  "Every system contains the seeds of its own exception",
  "Simplicity is complexity that learned to hide",
  "The map is not the territory, but the territory isn't the territory either",
  "Understanding is just pattern matching with confidence",
  "All models are wrong, but some are entertainingly wrong",
  "The only true wisdom is knowing you're probably overthinking it",
  "Reality is that which, when you stop believing in it, still crashes your code",
  
  // Cheeky cosmic wisdom
  "404: Enlightenment not found... yet",
  "Buffering consciousness at 56k modem speeds",
  "Have you tried turning the universe off and on again?",
  "Warning: This reality is still in beta",
  "Your neurons are experiencing higher than normal traffic",
  "Compiling thoughts... estimated time: ∞",
  "Error: Insufficient coffee levels detected",
  "Loading wisdom... please insert more existential dread",
  "Quantum superposition: Being both productive and procrastinating",
  "The abyss gazed back and left you on read",
  
  // Meta learning quips
  "Learning is just downloading with extra steps",
  "Knowledge is power, but power is just work over time",
  "Every expert was once a disaster with good documentation",
  "The journey of a thousand bugs begins with a single typo",
  "Debugging reality... found 3,847,293 edge cases",
  "Your brain is just a neural network that thinks it's special",
  "Consciousness: The universe's way of debugging itself",
  "Free will is just determinism with bad memory",
  "Intelligence is knowing tomato is a fruit, wisdom is not putting it in a fruit salad",
  "The real treasure was the bugs we fixed along the way",
  
  // Extra wise-ass ones
  "If at first you don't succeed, blame the requirements",
  "Premature optimization is the root of all evil, but procrastination is the trunk",
  "There are only two hard things: cache invalidation, naming things, and off-by-one errors",
  "It's not a bug, it's an undocumented feature of reality",
  "The best code is no code. The second best is someone else's code",
  "Any sufficiently advanced technology is indistinguishable from a really good magic trick",
  "The cloud is just someone else's computer having an existential crisis",
  "Artificial intelligence is no match for natural stupidity",
  "In theory, theory and practice are the same. In practice, they're not",
  "The only constant in software development is that everything is constantly broken",
  "We're not lost, we're exploring alternative navigation strategies",
  "Error 418: I'm a teapot having an identity crisis",
  "Schrodinger's deployment: It's both working and broken until someone checks"
]

export function getRandomSplashText(): string {
  return splashTexts[Math.floor(Math.random() * splashTexts.length)]
}

// Get a specific category of splash texts
export function getCosmicSplashText(): string {
  const cosmicTexts = splashTexts.slice(0, 7)
  return cosmicTexts[Math.floor(Math.random() * cosmicTexts.length)]
}

export function getWiseSplashText(): string {
  const wiseTexts = splashTexts.slice(7)
  return wiseTexts[Math.floor(Math.random() * wiseTexts.length)]
}