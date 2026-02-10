"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Activity, Gauge, Thermometer, Hash } from "lucide-react"
import type { DatasetSummary } from "@/lib/data-store"

function AnimatedValue({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const duration = 800
    const start = performance.now()
    const from = 0

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (value - from) * eased)
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  return <>{decimals > 0 ? display.toFixed(decimals) : Math.round(display)}</>
}

interface SummaryCardsProps {
  summary: DatasetSummary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const stats = [
    {
      label: "Total",
      value: summary.totalCount,
      unit: "units",
      decimals: 0,
      icon: Hash,
      color: "hsl(36, 100%, 50%)",
    },
    {
      label: "Avg Flow",
      value: summary.avgFlowrate,
      unit: "m\u00B3/h",
      decimals: 1,
      icon: Activity,
      color: "hsl(160, 60%, 45%)",
    },
    {
      label: "Avg Pressure",
      value: summary.avgPressure,
      unit: "bar",
      decimals: 2,
      icon: Gauge,
      color: "hsl(200, 80%, 55%)",
    },
    {
      label: "Avg Temp",
      value: summary.avgTemperature,
      unit: "\u00B0C",
      decimals: 1,
      icon: Thermometer,
      color: "hsl(340, 75%, 55%)",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 120,
            delay: index * 0.06,
          }}
          whileHover={{
            y: -4,
            transition: { type: "spring", damping: 20, stiffness: 300 },
          }}
          className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/50 backdrop-blur p-4"
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${stat.color}40, transparent)` }}
          />

          {/* Hover glow */}
          <div
            className="pointer-events-none absolute -top-12 -right-12 h-24 w-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
            style={{ backgroundColor: `${stat.color}15` }}
          />

          <div className="relative">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${stat.color}12` }}
            >
              <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
            </div>

            <div className="mt-3">
              <p className="font-serif text-3xl font-normal italic tabular-nums text-foreground">
                <AnimatedValue value={stat.value} decimals={stat.decimals} />
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                <span className="text-[11px] text-muted-foreground/40 font-mono">{stat.unit}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
