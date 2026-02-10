"use client"

import { motion } from "framer-motion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { EquipmentRow } from "@/lib/data-store"

const typeConfig: Record<string, { color: string }> = {
  Pump: { color: "#f5a623" },
  Compressor: { color: "#2dd4a8" },
  Valve: { color: "#38bdf8" },
  HeatExchanger: { color: "#a78bfa" },
  Reactor: { color: "#f472b6" },
  Condenser: { color: "#fb923c" },
}

interface EquipmentTableProps {
  data: EquipmentRow[]
}

export function EquipmentTable({ data }: EquipmentTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 120 }}
      className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border/30">
        <h3 className="font-serif text-base italic text-foreground">Equipment Readings</h3>
        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          {data.length} records
        </p>
      </div>
      <div className="overflow-auto max-h-[500px]">
        <Table>
          <TableHeader>
            <TableRow className="border-border/20 hover:bg-transparent">
              <TableHead className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold pl-5">Equipment</TableHead>
              <TableHead className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Type</TableHead>
              <TableHead className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold text-right">Flowrate</TableHead>
              <TableHead className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold text-right">Pressure</TableHead>
              <TableHead className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold text-right pr-5">Temp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => {
              const config = typeConfig[row.type] || { color: "#888" }
              return (
                <TableRow
                  key={`${row.name}-${i}`}
                  className="border-border/10 transition-colors hover:bg-primary/[0.02] group"
                >
                  <TableCell className="font-medium text-foreground text-sm pl-5">{row.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <span style={{ color: config.color }}>{row.type}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm text-foreground font-mono">{row.flowrate}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm text-foreground font-mono">{row.pressure}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm text-foreground font-mono pr-5">{row.temperature}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  )
}
