"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  radius: number
  baseRadius: number
  color: string
  pulse: number
  pulseSpeed: number
}

interface Ring {
  cx: number
  cy: number
  rx: number
  ry: number
  rotation: number
  rotationSpeed: number
  phase: number
  opacity: number
}

const GOLD = "rgba(245,166,35,"
const TEAL = "rgba(45,212,168,"
const BLUE = "rgba(56,189,248,"
const PINK = "rgba(244,114,182,"

export function Scene3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    // Create particles in 3D space
    const particles: Particle[] = []
    const colors = [GOLD, TEAL, BLUE, PINK]
    for (let i = 0; i < 120; i++) {
      const colorBase = colors[i % colors.length]
      particles.push({
        x: (Math.random() - 0.5) * w * 1.4,
        y: (Math.random() - 0.5) * h * 1.4,
        z: Math.random() * 600 - 300,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.15,
        radius: Math.random() * 2.5 + 1,
        baseRadius: Math.random() * 2.5 + 1,
        color: colorBase,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      })
    }

    // Floating orbital rings (projected 3D ellipses)
    const rings: Ring[] = [
      { cx: w * 0.25, cy: h * 0.3, rx: 180, ry: 60, rotation: 0, rotationSpeed: 0.003, phase: 0, opacity: 0.06 },
      { cx: w * 0.7, cy: h * 0.5, rx: 220, ry: 80, rotation: 0.5, rotationSpeed: -0.002, phase: 1, opacity: 0.04 },
      { cx: w * 0.5, cy: h * 0.7, rx: 150, ry: 50, rotation: 1.2, rotationSpeed: 0.004, phase: 2, opacity: 0.05 },
      { cx: w * 0.3, cy: h * 0.6, rx: 280, ry: 90, rotation: 0.8, rotationSpeed: -0.001, phase: 3, opacity: 0.035 },
    ]

    // Mouse tracking for parallax
    let mx = w / 2
    let my = h / 2
    const handleMouse = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
    }
    window.addEventListener("mousemove", handleMouse)

    const connectionDistance = 140

    const animate = () => {
      ctx.clearRect(0, 0, w, h)

      const t = performance.now() * 0.001
      const parallaxX = (mx - w / 2) * 0.02
      const parallaxY = (my - h / 2) * 0.02

      // Draw rings
      for (const ring of rings) {
        ring.rotation += ring.rotationSpeed
        ctx.save()
        ctx.translate(ring.cx + parallaxX * 0.5, ring.cy + parallaxY * 0.5)
        ctx.rotate(ring.rotation)
        ctx.beginPath()
        ctx.ellipse(0, 0, ring.rx + Math.sin(t + ring.phase) * 10, ring.ry + Math.cos(t * 0.7 + ring.phase) * 5, 0, 0, Math.PI * 2)
        ctx.strokeStyle = `${GOLD}${ring.opacity})`
        ctx.lineWidth = 1
        ctx.stroke()

        // Second ring slightly offset
        ctx.beginPath()
        ctx.ellipse(3, 3, ring.rx * 0.85, ring.ry * 0.85, 0.2, 0, Math.PI * 2)
        ctx.strokeStyle = `${TEAL}${ring.opacity * 0.6})`
        ctx.lineWidth = 0.5
        ctx.stroke()
        ctx.restore()
      }

      // Update & project particles
      const projected: { x: number; y: number; z: number; r: number; color: string; opacity: number }[] = []
      const focalLength = 500

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.z += p.vz
        p.pulse += p.pulseSpeed

        // Soft boundaries
        if (p.x < -w * 0.7 || p.x > w * 0.7) p.vx *= -1
        if (p.y < -h * 0.7 || p.y > h * 0.7) p.vy *= -1
        if (p.z < -300 || p.z > 300) p.vz *= -1

        p.radius = p.baseRadius * (1 + Math.sin(p.pulse) * 0.3)

        // 3D projection
        const scale = focalLength / (focalLength + p.z)
        const sx = w / 2 + (p.x + parallaxX * (1 + p.z * 0.001)) * scale
        const sy = h / 2 + (p.y + parallaxY * (1 + p.z * 0.001)) * scale
        const sr = p.radius * scale
        const depthOpacity = 0.1 + 0.5 * ((300 - p.z) / 600)

        projected.push({ x: sx, y: sy, z: p.z, r: sr, color: p.color, opacity: depthOpacity })
      }

      // Draw connections
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i]
          const b = projected[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.08 * Math.min(a.opacity, b.opacity)
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `${GOLD}${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Draw particles (sorted by z for depth)
      projected.sort((a, b) => b.z - a.z)
      for (const p of projected) {
        // Glow
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6)
        glow.addColorStop(0, `${p.color}${p.opacity * 0.2})`)
        glow.addColorStop(1, `${p.color}0)`)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.opacity})` 
        ctx.fill()
      }

      // Subtle vignette
      const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.9)
      vg.addColorStop(0, "rgba(10,10,10,0)")
      vg.addColorStop(1, "rgba(10,10,10,0.6)")
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, w, h)

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ background: "transparent" }}
      aria-hidden="true"
    />
  )
}
