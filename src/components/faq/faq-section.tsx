"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import Script from "next/script"

export type FaqItem = {
  question: string
  answer: string
}

interface FaqSectionProps {
  id?: string
  title?: string
  items?: FaqItem[]
}

export function FaqSection({ id = "faq", title = "Frequently Asked Questions", items = [] }: FaqSectionProps) {
  const faqJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  }), [items])

  return (
    <section id={id} className="p-responsive-xl bg-white/50 dark:bg-slate-800/50">
      <div className="container-responsive">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-responsive-3xl lg:text-responsive-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-teal-600 to-pink-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-responsive-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Answers to the most common questions about SoloSuccess AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.03 }}
              viewport={{ once: true }}
              className="rounded-xl border border-purple-200 dark:border-teal-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.question}</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <Script id={`${id}-faq-jsonld`} type="application/ld+json">
        {JSON.stringify(faqJsonLd)}
      </Script>
    </section>
  )
}

export default FaqSection


