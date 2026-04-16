import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { getSanityConfig } from '../env'

const sanityConfig = getSanityConfig()
const builder = sanityConfig ? createImageUrlBuilder(sanityConfig) : null

export const urlFor = (source: SanityImageSource) => {
  return builder?.image(source) ?? null
}
