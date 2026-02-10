"use client"

import React, { useCallback, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileUp, Loader2, CheckCircle2 } from "lucide-react"

interface CSVUploaderProps {
  onUploadSuccess: (datasetId: string) => void
}

export function CSVUploader({ onUploadSuccess }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".csv")) {
        setError("Only CSV files are accepted")
        return
      }
      setIsUploading(true)
      setError(null)
      setUploadSuccess(false)
      try {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Upload failed")
        setUploadSuccess(true)
        onUploadSuccess(data.id)
        setTimeout(() => setUploadSuccess(false), 3000)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed")
      } finally {
        setIsUploading(false)
      }
    },
    [onUploadSuccess]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleUpload(file)
    },
    [handleUpload]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleUpload(file)
      e.target.value = ""
    },
    [handleUpload]
  )

  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      transition={{ type: "spring", damping: 30, stiffness: 400 }}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isDragging
          ? "border-primary bg-primary/5"
          : uploadSuccess
            ? "border-chart-2/40 bg-chart-2/5"
            : "border-border/50 bg-card/40 backdrop-blur hover:border-primary/30"
      }`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Animated gradient sweep */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: "linear-gradient(105deg, transparent 40%, hsl(36 100% 50% / 0.03) 45%, hsl(36 100% 50% / 0.06) 50%, hsl(36 100% 50% / 0.03) 55%, transparent 60%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 3s ease-in-out infinite",
        }}
      />

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="relative flex flex-col items-center gap-4 px-8 py-10">
        {/* Icon */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isUploading ? "loading" : uploadSuccess ? "success" : "idle"}
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className={`flex h-16 w-16 items-center justify-center rounded-2xl border transition-colors ${
              uploadSuccess
                ? "bg-chart-2/10 border-chart-2/20"
                : isDragging
                  ? "bg-primary/10 border-primary/20"
                  : "bg-card border-border/50 group-hover:border-primary/20"
            }`}
          >
            {isUploading ? (
              <Loader2 className="h-7 w-7 text-primary animate-spin" />
            ) : uploadSuccess ? (
              <CheckCircle2 className="h-7 w-7 text-chart-2" />
            ) : (
              <Upload className={`h-7 w-7 transition-all ${isDragging ? "text-primary -translate-y-0.5" : "text-muted-foreground group-hover:text-primary"}`} />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="text-center">
          <p className="font-serif text-lg italic text-foreground">
            {uploadSuccess ? "Data Imported" : isDragging ? "Drop to Analyze" : "Import Equipment Data"}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground max-w-md leading-relaxed">
            {"Drag your CSV file here. Columns: Name, Type, Flowrate, Pressure, Temperature"}
          </p>
        </div>

        <label htmlFor="csv-upload" className="cursor-pointer">
          <motion.span
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <FileUp className="h-3.5 w-3.5" />
            Browse Files
          </motion.span>
        </label>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          className="sr-only"
          onChange={handleFileInput}
          disabled={isUploading}
        />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-full bg-destructive/10 border border-destructive/20 px-4 py-1.5 text-xs text-destructive font-medium"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
