import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

if (!projectId || !dataset) {
  console.warn(
    '[sanity] NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET is not set. ' +
      'Sanity queries will be skipped until real credentials are provided.'
  )
}

export const client = createClient({
  projectId: projectId || 'placeholder',
  dataset: dataset || 'production',
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
})
