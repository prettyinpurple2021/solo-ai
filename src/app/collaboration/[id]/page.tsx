"use client"

import { ActiveSessionView } from "@/components/collaboration/active-session-view"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { use } from "react"

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  return (
    <div className="container mx-auto py-6 space-y-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4 text-muted-foreground hover:text-white"
        onClick={() => router.push('/collaboration')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Button>
      
      <ActiveSessionView sessionId={id} />
    </div>
  )
}
