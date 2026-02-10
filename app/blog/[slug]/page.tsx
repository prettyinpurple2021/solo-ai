
import { getPostData } from '@/lib/blog'
import { CyberPageLayout } from '@/components/cyber/CyberPageLayout'
import { HudBorder } from '@/components/cyber/HudBorder'
import { Calendar, User, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown' // We might need to install this or handle markdown rendering
import { Metadata } from 'next'

// Add markdown rendering support
// Note: Ideally we'd use a markdown component here. For now, we'll display raw text or simple HTML.
// Better yet, let's use a simple renderer if we don't want to add more deps, or just use `dangerouslySetInnerHTML` if we parse it first.
// Actually, let's just use a simple whitespace-pre-wrap for now to get it working, or install react-markdown.
// Given strict production rules, let's try to do it right. I'll stick to a simple pre-wrap for the MVP iteration to verify data flow, 
// but I should really recommend a markdown renderer. 
// Wait, I can't easily install new deps without asking. 
// I will use a simple text display for now and maybe suggest `react-markdown` later.
// Actually, I'll use a basic custom renderer for headers/paragraphs to make it look decent.


type Props = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostData(slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: `${post.title} | SoloSuccess AI`,
    description: post.excerpt,
  }
}

export default async function Post({ params }: Props) {
  const { slug } = await params
  const post = getPostData(slug)

  if (!post) {
    notFound()
  }

  return (
    <CyberPageLayout>
      <div className="pt-32 pb-20">
        <article className="max-w-4xl mx-auto px-6">
          <Link href="/blog" className="inline-flex items-center text-neon-purple hover:text-white transition-colors mb-8 font-mono text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Transmission Log
          </Link>

          <HudBorder className="p-8 md:p-12 mb-12 bg-black/40 backdrop-blur-sm">
            <header className="mb-8">
              <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-gray-400 mb-6">
                <span className="text-neon-cyan px-2 py-1 bg-neon-cyan/10 border border-neon-cyan/30 rounded">
                  {post.category}
                </span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-orbitron font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>
            </header>
            
            <div className="prose prose-invert prose-lg max-w-none prose-headings:font-orbitron prose-headings:text-white prose-p:text-gray-300 prose-a:text-neon-cyan prose-strong:text-white font-sans">
               {/* Simple renderer for now */}
               {post.content.split('\n').map((line, i) => {
                   if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mt-8 mb-4">{line.replace('# ', '')}</h1>
                   if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-6 mb-3">{line.replace('## ', '')}</h2>
                   if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace('### ', '')}</h3>
                   if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.replace('- ', '')}</li>
                   if (line.trim() === '') return <div key={i} className="h-4" />
                   return <p key={i} className="mb-2 text-justify">{line}</p>
               })}
            </div>
          </HudBorder>
        </article>
      </div>
    </CyberPageLayout>
  )
}
