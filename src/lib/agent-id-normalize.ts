/**
 * Canonical lowercase agent IDs: aura, finn, blaze, glitch, vex, roxy, lexi, nova, echo, lumi.
 * Maps legacy IDs from older clients / stored rows to the current ID.
 */
export function canonicalAgentId(raw: string): string {
  const id = raw.toLowerCase().trim()
  if (id === 'aurara') return 'aura'
  if (id === 'ace') return 'finn'
  return id
}
