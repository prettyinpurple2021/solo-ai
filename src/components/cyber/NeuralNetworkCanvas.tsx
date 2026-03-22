"use client"

import { useEffect, useLayoutEffect, useRef } from "react"

interface NeuralNetworkCanvasProps {
  particleCount?: number
  connectionDistance?: number
  mouseDistance?: number
}

export function NeuralNetworkCanvas({
  particleCount = 60,
  connectionDistance = 150,
  mouseDistance = 200,
}: NeuralNetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Sync backing-store size before paint to avoid default 300×150 flash / layout nits (CLS).
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof window === "undefined") return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = canvas.width || window.innerWidth
    let height = canvas.height || window.innerHeight

    function resize() {
      if (!canvas) return
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    window.addEventListener("resize", resize)
    resize()

    // Particle configuration
    const particles: Particle[] = []
    const mouse = { x: null as number | null, y: null as number | null }

    // Mouse position tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.x
      mouse.y = e.y
    }

    const handleMouseOut = () => {
      mouse.x = null
      mouse.y = null
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseout", handleMouseOut)

    // Particle Class
    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string

      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        // Slow the background animation slightly for a calmer effect
        this.vx = (Math.random() - 0.5) * 0.25
        this.vy = (Math.random() - 0.5) * 0.25
        this.size = Math.random() * 2 + 1
        this.color = Math.random() > 0.5 ? '#00f3ff' : '#bd00ff'
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1
        if (this.y < 0 || this.y > height) this.vy *= -1

        // Mouse interaction
        if (mouse.x != null && mouse.y != null) {
          const dx = mouse.x - this.x
          const dy = mouse.y - this.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < mouseDistance) {
            const forceDirectionX = dx / distance
            const forceDirectionY = dy / distance
            const force = (mouseDistance - distance) / mouseDistance
            const directionX = forceDirectionX * force * 0.5
            const directionY = forceDirectionY * force * 0.5
            this.vx -= directionX
            this.vy -= directionY
          }
        }
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Animation Loop
    function animate() {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].draw()

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(0, 243, 255, ${1 - distance / connectionDistance})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseout", handleMouseOut)
    }
  }, [particleCount, connectionDistance, mouseDistance])

  return (
    <canvas
      ref={canvasRef}
      id="neural-network"
      className="pointer-events-none fixed left-0 top-0 -z-10 block h-full w-full max-h-[100vh] max-w-[100vw]"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, transparent 0%, #020005 100%)",
      }}
      aria-hidden="true"
    />
  )
}

