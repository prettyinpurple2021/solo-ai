"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Bug, Camera, CheckCircle2, ImageOff, Send } from "lucide-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PrimaryButton } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FeedbackFormState = {
  name: string
  email: string
  type: 'bug' | 'feature_request' | 'comment' | 'error' | 'other'
  title: string
  message: string
  screenshot: File | null
}

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/avif"]

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const initialState: FeedbackFormState = {
  name: "",
  email: "",
  type: "bug",
  title: "",
  message: "",
  screenshot: null,
}

const toAttachment = async (file: File) => {
  const buffer = await file.arrayBuffer()
  return {
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    data: new Uint8Array(buffer),
  }
}

export function FeedbackWidget() {
  const prefersReducedMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FeedbackFormState>(initialState)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const url = previewUrl
    return () => {
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  }, [previewUrl])

  const floatingVariants = useMemo(
    () => ({
      initial: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
      animate: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0 : 0.24 } },
      whileHover: prefersReducedMotion ? undefined : { scale: 1.02, transition: { duration: 0.15 } },
      whileTap: prefersReducedMotion ? undefined : { scale: 0.98 },
    }),
    [prefersReducedMotion],
  )

  const handleFileChange = (file?: File) => {
    if (!file) return

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PNG, JPG, WEBP, or AVIF image.",
        variant: "destructive",
      })
      return
    }

    if (file.size > MAX_SCREENSHOT_BYTES) {
      toast({
        title: "Image is too large",
        description: "Limit screenshots to 5MB or smaller.",
        variant: "destructive",
      })
      return
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setForm((prev) => ({ ...prev, screenshot: file }))
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    const trimmedMessage = form.message.trim()
    const trimmedEmail = form.email.trim()
    const trimmedName = form.name.trim()

    if (!trimmedMessage) {
      toast({
        title: "Add a brief description",
        description: "Tell us what went wrong so we can fix it fast.",
        variant: "warning",
      })
      return
    }

    if (trimmedEmail && !emailPattern.test(trimmedEmail)) {
      toast({
        title: "Invalid email",
        description: "Enter a valid email address or leave the field blank.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const getScreenBucket = () => {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
      };

      const browserInfo = {
        platform: (navigator as any).userAgentData?.platform || (navigator as any).platform || 'unknown',
        screenBucket: getScreenBucket(),
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
      }

      const formData = new FormData();
      formData.append('type', form.type);
      if (form.title) formData.append('title', form.title);
      formData.append('message', trimmedMessage);
      formData.append('browserInfo', JSON.stringify(browserInfo));
      if (form.screenshot) {
        formData.append('screenshot', form.screenshot);
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to transmit data")
      }

      toast({
        title: "Thanks — we got it!",
        description: "Your message was sent successfully.",
        variant: "success",
      })

      setForm(initialState)
      setPreviewUrl(null)
      setOpen(false)
    } catch (error) {
      logger.error(
        "Failed to submit feedback",
        { source: "feedback-widget", hasScreenshot: Boolean(form.screenshot) },
        error as Error,
      )

      toast({
        title: "Unable to send feedback",
        description: "Please retry in a moment or contact support if this continues.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetAndClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setForm(initialState)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(null)
    }
    setOpen(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogTrigger asChild>
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          {...floatingVariants}
          initial="initial"
          animate="animate"
          whileHover="whileHover"
          whileTap="whileTap"
        >
          <PrimaryButton
            aria-label="Report a bug"
            className="shadow-[0_0_20px_rgba(99,102,241,0.45)]"
            size="lg"
            variant="cyan"
          >
            <Bug className="mr-2 h-4 w-4" aria-hidden />
            Report a bug
          </PrimaryButton>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl border border-white/10 bg-slate-950/95 p-0 text-foreground shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Submit Feedback</DialogTitle>
          <DialogDescription>Share details about any issues you encounter.</DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0 : 0.22 } }}
        >
            <div className="bg-linear-to-br from-slate-900/80 via-indigo-900/40 to-purple-900/40">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-2xl bg-linear-to-br from-purple-500/30 via-indigo-500/20 to-cyan-500/30 p-3">
                <Bug className="h-5 w-5 text-purple-100" aria-hidden />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-xl font-semibold text-white">Found a bug?</DialogTitle>
                <DialogDescription className="text-sm text-slate-200">
                  Tell us what happened. You can include a screenshot so we can reproduce and fix it quickly.
                </DialogDescription>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="feedback-type">Category</Label>
                  <Select
                    value={form.type}
                    onValueChange={(value: FeedbackFormState['type']) => setForm((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger id="feedback-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature_request">Feature Request</SelectItem>
                      <SelectItem value="comment">General Comment</SelectItem>
                      <SelectItem value="error">System Error</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedback-title">Subject (optional)</Label>
                  <Input
                    id="feedback-title"
                    name="title"
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Brief summary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="feedback-name">Name (optional)</Label>
                  <Input
                    id="feedback-name"
                    name="name"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="How should we address you?"
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedback-email">Email (optional)</Label>
                  <Input
                    id="feedback-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="you@example.com"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback-message">What went wrong?</Label>
                <Textarea
                  id="feedback-message"
                  name="message"
                  value={form.message}
                  onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                  placeholder="Describe what you were doing, what you expected, and what happened instead."
                  minLength={12}
                  rows={4}
                  aria-required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="feedback-screenshot">Screenshot (optional)</Label>
                <div className="flex flex-col gap-3 md:flex-row">
                  <label
                    htmlFor="feedback-screenshot"
                    className={cn(
                      "flex min-h-[120px] flex-1 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-purple-300/40 px-4 py-6 text-center transition hover:border-purple-200 hover:bg-purple-500/5 focus-within:ring-2 focus-within:ring-purple-400 focus-within:ring-offset-2 focus-within:ring-offset-slate-950",
                      form.screenshot ? "border-purple-300 bg-purple-500/5" : "",
                    )}
                  >
                    <div className="space-y-2">
                      <Camera className="mx-auto h-6 w-6 text-purple-200" aria-hidden />
                      <p className="text-sm text-slate-100">
                        {form.screenshot ? "Change screenshot" : "Attach a screenshot"}
                      </p>
                      <p className="text-xs text-slate-300">PNG, JPG, WEBP, or AVIF up to 5MB</p>
                    </div>
                    <input
                      id="feedback-screenshot"
                      type="file"
                      accept={ACCEPTED_IMAGE_TYPES.join(",")}
                      className="sr-only"
                      aria-label="Upload a screenshot to include with your feedback"
                      onChange={(event) => handleFileChange(event.target.files?.[0])}
                    />
                  </label>

                  {previewUrl ? (
                    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 md:w-48">
                      <img
                        src={previewUrl}
                        alt="Screenshot preview"
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 rounded-full bg-slate-900/80 px-2 py-1 text-xs text-slate-100 transition hover:bg-slate-800"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, screenshot: null }))
                          if (previewUrl) {
                            URL.revokeObjectURL(previewUrl)
                          }
                          setPreviewUrl(null)
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-6 text-sm text-slate-300 md:w-48">
                      <ImageOff className="mr-2 h-4 w-4 text-slate-400" aria-hidden />
                      No screenshot attached
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden />
                  We’ll include recent session data to speed up triage.
                </div>
                <div className="flex items-center gap-3">
                  <DialogClose asChild>
                    <PrimaryButton variant="cyan" className="md:hidden" onClick={() => resetAndClose(false)}>
                      Cancel
                    </PrimaryButton>
                  </DialogClose>
                  <PrimaryButton
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="min-w-[140px]"
                    variant="purple"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loading size="sm" />
                        Sending…
                      </div>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" aria-hidden />
                        Send feedback
                      </>
                    )}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

