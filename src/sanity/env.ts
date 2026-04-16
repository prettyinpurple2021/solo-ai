export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-03-02'

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

export interface SanityPublicConfig {
  projectId: string
  dataset: string
  apiVersion: string
}

export function getSanityConfig(): SanityPublicConfig | null {
  if (!projectId || !dataset) {
    return null
  }

  return {
    projectId,
    dataset,
    apiVersion,
  }
}

export function isSanityConfigured(): boolean {
  return getSanityConfig() !== null
}
