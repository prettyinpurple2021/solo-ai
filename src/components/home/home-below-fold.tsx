"use client"

import {
  FeaturesSection,
  AgentsSection,
  PricingSection,
  FAQSection,
} from "@/components/home/landing-sections"

/**
 * Below-the-fold landing sections — loaded as a separate chunk to reduce
 * initial JS on `/` and improve LCP / main-thread time.
 */
export default function HomeBelowFold() {
  return (
    <>
      <FeaturesSection />
      <AgentsSection />
      <PricingSection />
      <FAQSection />
    </>
  )
}
