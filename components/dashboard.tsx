"use client"

import { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { CSVUploader } from "@/components/csv-uploader"
import { EquipmentTable } from "@/components/equipment-table"
import { EquipmentCharts } from "@/components/equipment-charts"
import { SummaryCards } from "@/components/summary-cards"
import { UploadHistory } from "@/components/upload-history"
import { Button } from "@/components/ui/button"
import { Download, FlaskConical, BarChart3, Table2, Sparkles } from "lucide-react"
import type { DatasetSummary } from "@/lib/data-store"
import { Suspense } from "react"

const Scene3D = dynamic(
  () => import("@/components/scene-3d").then((mod) => mod.Scene3D),
  { ssr: false }
)

interface HistoryItem {
  id: string
  uploadedAt: string
  fileName: string
  totalCount: number
  avgFlowrate: number
  avgPressure: number
  avgTemperature: number
  typeDistribution: Record<string, number>
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
}

const fadeSlide = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", damping: 25, stiffness: 120 },
  },
}

export function Dashboard() {
  const [activeDataset, setActiveDataset] = useState<DatasetSummary | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"charts" | "table">("charts")
  const [showHistory, setShowHistory] = useState(false)

  const fetchHistory = useCallback(async () => {
    const res = await fetch("/api/datasets")
    const data = await res.json()
    setHistory(data)
    return data as HistoryItem[]
  }, [])

  const fetchDataset = useCallback(async (id: string) => {
    const res = await fetch(`/api/datasets/${id}`)
    const data = await res.json()
    setActiveDataset(data)
    setActiveId(id)
  }, [])

  useEffect(() => {
    fetchHistory().then((data) => {
      if (data.length > 0) fetchDataset(data[0].id)
    })
  }, [fetchHistory, fetchDataset])

  const handleUploadSuccess = useCallback(
    async (id: string) => {
      await fetchHistory()
      await fetchDataset(id)
    },
    [fetchHistory, fetchDataset]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      await fetch(`/api/datasets/${id}`, { method: "DELETE" })
      const updated = await fetchHistory()
      if (id === activeId) {
        if (updated.length > 0) await fetchDataset(updated[0].id)
        else {
          setActiveDataset(null)
          setActiveId(null)
        }
      }
    },
    [activeId, fetchHistory, fetchDataset]
  )

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* 3D Background */}
      <Suspense fallback={null}>
        <Scene3D />
      </Suspense>

      {/* Radial gradient overlay for readability */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background: "radial-gradient(ellipse at 30% 20%, transparent 0%, hsl(0 0% 4% / 0.7) 60%, hsl(0 0% 4% / 0.95) 100%)",
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-2xl bg-background/60"
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <FlaskConical className="h-4 w-4 text-primary" />
              <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-xl italic text-foreground">ChemViz</span>
              <span className="hidden sm:inline text-[10px] font-sans uppercase tracking-[0.25em] text-muted-foreground">
                Analytics
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeDataset && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden lg:flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur px-4 py-1.5"
              >
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-xs text-muted-foreground">{activeDataset.fileName}</span>
                <span className="text-[10px] font-mono text-primary">{activeDataset.totalCount}</span>
              </motion.div>
            )}
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors lg:hidden"
            >
              History
              {history.length > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {history.length}
                </span>
              )}
            </button>
            {activeId && (
              <Button
                onClick={() => window.open(`/api/report/${activeId}`, "_blank")}
                size="sm"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-4 text-xs font-semibold"
              >
                <Download className="h-3 w-3" />
                Export
              </Button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-[1400px] px-6 py-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-6 lg:grid-cols-[1fr_280px]"
        >
          {/* Main column */}
          <div className="flex flex-col gap-6 min-w-0">
            {/* Hero text */}
            <motion.div variants={fadeSlide} className="mb-2">
              <h1 className="font-serif text-4xl md:text-5xl italic text-foreground leading-[1.1]">
                Equipment <span className="text-primary">Parameter</span> Visualizer
              </h1>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground leading-relaxed">
                Upload CSV datasets with equipment readings. Analyze flowrate, pressure, and temperature distributions through interactive charts.
              </p>
            </motion.div>

            {/* Upload */}
            <motion.div variants={fadeSlide}>
              <CSVUploader onUploadSuccess={handleUploadSuccess} />
            </motion.div>

            {/* Stats */}
            <AnimatePresence mode="wait">
              {activeDataset && (
                <motion.div
                  key={activeId}
                  initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", damping: 25, stiffness: 120 }}
                >
                  <SummaryCards summary={activeDataset} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tab bar + content */}
            <AnimatePresence mode="wait">
              {activeDataset && (
                <motion.div
                  key="tabs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 120, delay: 0.1 }}
                >
                  {/* Custom tab bar */}
                  <div className="flex items-center gap-1 rounded-full border border-border bg-card/60 backdrop-blur p-1 w-fit mb-6">
                    {[
                      { id: "charts" as const, label: "Visualizations", icon: BarChart3 },
                      { id: "table" as const, label: "Data Table", icon: Table2 },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition-colors ${
                          activeTab === tab.id
                            ? "text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {activeTab === tab.id && (
                          <motion.div
                            layoutId="tab-bg"
                            className="absolute inset-0 rounded-full bg-primary"
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                          />
                        )}
                        <tab.icon className="relative z-10 h-3.5 w-3.5" />
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      {activeTab === "charts" ? (
                        <EquipmentCharts summary={activeDataset} />
                      ) : (
                        <EquipmentTable data={activeDataset.data} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state */}
            {!activeDataset && (
              <motion.div
                variants={fadeSlide}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/30 backdrop-blur p-16 text-center"
              >
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-2xl bg-primary/5 border border-primary/10" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary/60" />
                </div>
                <h2 className="font-serif text-2xl italic text-foreground">Awaiting Data</h2>
                <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
                  Upload a CSV with equipment parameters to begin exploring your data through 3D-enhanced visualizations.
                </p>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <motion.aside
            variants={fadeSlide}
            className={`${showHistory ? "block" : "hidden"} lg:block`}
          >
            <div className="lg:sticky lg:top-24">
              <UploadHistory
                datasets={history}
                activeId={activeId}
                onSelect={(id) => {
                  fetchDataset(id)
                  setShowHistory(false)
                }}
                onDelete={handleDelete}
              />
            </div>
          </motion.aside>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-16 border-t border-border/30">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-3 w-3 text-muted-foreground/50" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
              ChemViz 2026
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/30">
            web + desktop
          </span>
        </div>
      </footer>
    </div>
  )
}
