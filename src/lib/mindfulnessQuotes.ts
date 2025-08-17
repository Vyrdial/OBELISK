export const mindfulnessQuotes = [
  {
    text: "The present moment is the only time over which we have dominion.",
    author: "Thích Nhất Hạnh"
  },
  {
    text: "Breathing in, I calm body and mind. Breathing out, I smile.",
    author: "Thích Nhất Hạnh"
  },
  {
    text: "You are the sky. Everything else is just the weather.",
    author: "Pema Chödrön"
  },
  {
    text: "In the end, just three things matter: How well we have lived. How well we have loved. How well we have learned to let go.",
    author: "Jack Kornfield"
  },
  {
    text: "The mind is like water. When it's agitated, it becomes difficult to see. When it's calm, everything becomes clear.",
    author: "Prasad Mahes"
  },
  {
    text: "Meditation is not about stopping thoughts, but recognizing that we are more than our thoughts and our feelings.",
    author: "Arianna Huffington"
  },
  {
    text: "Your calm mind is the ultimate weapon against your challenges.",
    author: "Bryant McGill"
  },
  {
    text: "The quieter you become, the more you can hear.",
    author: "Ram Dass"
  },
  {
    text: "Peace comes from within. Do not seek it without.",
    author: "Buddha"
  },
  {
    text: "The soul always knows what to do to heal itself. The challenge is to silence the mind.",
    author: "Caroline Myss"
  }
]

export function getRandomQuote() {
  return mindfulnessQuotes[Math.floor(Math.random() * mindfulnessQuotes.length)]
}