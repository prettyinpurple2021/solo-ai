"use client"

import { logError } from '@/lib/logger'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'

export default function ExitIntentSurvey() {
  // Allow disabling via env toggle
  const exitIntentDisabled = process.env.NEXT_PUBLIC_DISABLE_EXIT_INTENT === 'true'
  if (exitIntentDisabled) return null

  const [open, setOpen] = useState(false)
  const [role, setRole] = useState('')
  const [goal, setGoal] = useState('')
  const [blocker, setBlocker] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [canShow, setCanShow] = useState(false)
  const [statusChecked, setStatusChecked] = useState(false)
  const { getToken } = useAuth()
  const timerRef = useState<{ current: NodeJS.Timeout | null }>({ current: null })[0] // Using state as stable ref since useRef import missing or just use useRef if I add import.
  // Wait, I should add useRef to imports.

  // Check survey status from database on mount
  useEffect(() => {
    const checkSurveyStatus = async () => {
      try {
        const token = await getToken()
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }
        
        const response = await fetch('/api/surveys/exit-intent', {
          method: 'GET',
          headers,
        })
        
        if (response.ok) {
          const data = await response.json()
          const { status, canShow: serverCanShow } = data
          
          if (status === 'submitted') {
            setSubmitted(true)
            setCanShow(false)
          } else if (status === 'dismissed') {
            setDismissed(true)
            setCanShow(false)
          } else if (serverCanShow) {
            // Add 3-second delay before survey can show for new users
            const timer = setTimeout(() => {
              setCanShow(true)
            }, 3000)
            timerRef.current = timer
            setStatusChecked(true)
          }
        }
        setStatusChecked(true)
      } catch (error) {
        logError('Failed to check survey status:', error)
        // On error, still allow survey after delay for anonymous users
        const timer = setTimeout(() => {
          setCanShow(true)
        }, 3000)
         timerRef.current = timer
        setStatusChecked(true)
      }
    }
    
    checkSurveyStatus()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [getToken])

  useEffect(() => {
    // Don't show survey if user already submitted, dismissed, not ready yet, or status not checked
    if (submitted || dismissed || !canShow || !statusChecked) return
    
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !submitted && !dismissed && canShow && statusChecked) {
        setOpen(true)
      }
    }
    
    window.addEventListener('mouseout', onMouseLeave)
    return () => window.removeEventListener('mouseout', onMouseLeave)
  }, [submitted, dismissed, canShow, statusChecked])

  const submit = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const token = await getToken()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      
      const response = await fetch('/api/surveys/exit-intent', {
        method: 'POST',
        headers,
        body: JSON.stringify({ role, goal, blocker, email }),
      })
      
      if (response.ok) {
        setSubmitted(true)
        setOpen(false)
      } else {
        logError('Failed to submit survey: Server error')
        // Even if submission fails, mark as submitted to avoid repeated attempts
        setSubmitted(true)
        setOpen(false)
      }
    } catch (error) {
      logError('Failed to submit survey:', error)
      // Even if submission fails, mark as submitted to avoid repeated attempts
      setSubmitted(true)
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkip = async () => {
    try {
      const token = await getToken()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      
      await fetch('/api/surveys/exit-intent', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'dismiss' }),
      })
      
      setDismissed(true)
      setOpen(false)
    } catch (error) {
      logError('Failed to dismiss survey:', error)
      // Even if API call fails, still dismiss locally
      setDismissed(true)
      setOpen(false)
    }
  }

  if (!open || submitted || dismissed) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg border-2 border-neon-cyan bg-dark-card p-6 shadow-[0_0_30px_rgba(11,228,236,0.3)] rounded-sm overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Scanlines overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] opacity-20" />
        
        {/* Corner accents */}
        <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-neon-purple" />
        <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-neon-purple" />
        <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-neon-purple" />
        <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-neon-purple" />
        
        <h3 className="font-orbitron text-xl font-bold uppercase tracking-wider text-neon-cyan mb-2 relative z-10">
          Before you go—
        </h3>
        <p className="font-mono text-gray-300 mb-6 relative z-10">
          Mind a 1‑minute survey? Help us tailor SoloSuccess AI for you. <span className="text-gray-500">Totally optional.</span>
        </p>
        
        <div className="grid grid-cols-1 gap-4 relative z-10">
          <Input 
            className="bg-dark-bg border-gray-700 text-neon-purple placeholder:text-gray-500 focus:border-neon-cyan focus:ring-neon-cyan/20"
            placeholder="Your role (e.g., Solo Founder)" 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
          />
          <Input 
            className="bg-dark-bg border-gray-700 text-neon-purple placeholder:text-gray-500 focus:border-neon-cyan focus:ring-neon-cyan/20"
            placeholder="Primary goal (e.g., automate content)" 
            value={goal} 
            onChange={(e) => setGoal(e.target.value)} 
          />
          <Input 
            className="bg-dark-bg border-gray-700 text-neon-purple placeholder:text-gray-500 focus:border-neon-cyan focus:ring-neon-cyan/20"
            placeholder="Top blocker (e.g., time)" 
            value={blocker} 
            onChange={(e) => setBlocker(e.target.value)} 
          />
          <Input 
            className="bg-dark-bg border-gray-700 text-neon-purple placeholder:text-gray-500 focus:border-neon-cyan focus:ring-neon-cyan/20"
            placeholder="Email (optional)" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        
        <div className="mt-6 flex gap-3 justify-end relative z-10">
          <Button 
            variant="ghost"
            onClick={handleSkip}
            className="text-gray-400 hover:text-neon-magenta hover:bg-neon-magenta/10"
          >
            Skip
          </Button>
          <Button 
            variant="cyan"
            onClick={submit} 
            disabled={submitting}
            className="font-bold"
          >
            {submitting ? 'Saving…' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  )
}

