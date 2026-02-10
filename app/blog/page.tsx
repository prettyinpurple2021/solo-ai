
import Link from 'next/link'
import { CyberPageLayout } from '@/components/cyber/CyberPageLayout'
import { HudBorder } from '@/components/cyber/HudBorder'
import { BookOpen, Calendar, Search, Clock } from 'lucide-react'
import { getSortedPostsData } from '@/lib/blog'

export const dynamic = 'force-dynamic'

export default function BlogPage() {
  const allPostsData = getSortedPostsData()

  return (
    <CyberPageLayout>
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-purple/30 bg-neon-purple/5 rounded-none mb-6">
              <BookOpen className="w-4 h-4 text-neon-purple" />
              <span className="text-xs font-bold tracking-widest text-neon-purple uppercase">Knowledge Base</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6">
              BOSS <span className="text-neon-purple">BLOG</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-mono">
              Strategic intelligence and insights for building your empire.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPostsData.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <HudBorder variant="hover" className="p-6 h-full cursor-pointer flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-orbitron text-neon-purple uppercase tracking-widest">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="font-orbitron text-xl text-white mb-3 flex-grow">{post.title}</h3>
                  <p className="text-sm text-gray-400 font-mono mb-6 leading-relaxed line-clamp-3">{post.excerpt}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 font-mono mt-auto border-t border-white/10 pt-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                    </div>
                  </div>
                </HudBorder>
              </Link>
            ))}
          </div>
          
          {allPostsData.length === 0 && (
              <div className="text-center text-gray-500 font-mono mt-12">
                  No transmissions found. Check back later.
              </div>
          )}
        </div>
      </div>
    </CyberPageLayout>
  )
}
