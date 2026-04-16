import { createClient } from 'next-sanity'

import { apiVersion, dataset, getSanityConfig, isSanityConfigured, projectId } from '../env'

export const client = createClient({
  projectId: projectId || 'placeholder-project-id',
  dataset: dataset || 'placeholder-dataset',
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
})

export { getSanityConfig, isSanityConfigured }
