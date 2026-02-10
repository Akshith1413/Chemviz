"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Clock, Trash2, FileSpreadsheet, Database } from "lucide-react"
import { format } from "date-fns"

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

interface UploadHistoryProps {
  datasets: HistoryItem[]
  activeId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export function UploadHistory({ datasets, activeId, onSelect, onDelete }: UploadHistoryProps) {
  if (datasets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/40 bg-card/30 backdrop-blur p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 border border-border/30">
          <Database className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-xs font-medium text-muted-foreground">No datasets yet</p>
        <p className="mt-1 text-[10px] text-muted-foreground/50">Upload a CSV to begin</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">Datasets</span>
        </div>
        <span className="text-[9px] font-mono text-muted-foreground/50">{datasets.length}/5</span>
      </div>

      <div className="flex flex-col p-1.5">
        <AnimatePresence>
          {datasets.map((dataset, i) => {
            const isActive = activeId === dataset.id
            return (
              <motion.div
                key={dataset.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                transition={{ delay: i * 0.03, type: "spring", damping: 25, stiffness: 200 }}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(dataset.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelect(dataset.id)
                }}
                className={`group flex items-center gap-2.5 rounded-xl p-2.5 cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-primary/8 border border-primary/15"
                    : "border border-transparent hover:bg-muted/30"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isActive ? "bg-primary/15" : "bg-muted/40"
                  }`}
                >
                  <FileSpreadsheet
                    className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">
                    {dataset.fileName}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 font-mono">
                    {format(new Date(dataset.uploadedAt), "MMM d, HH:mm")}
                    {" \u00B7 "}
                    {dataset.totalCount}
                  </p>
                </div>

                <button
                  type="button"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(dataset.id)
                  }}
                  aria-label={`Delete ${dataset.fileName}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
