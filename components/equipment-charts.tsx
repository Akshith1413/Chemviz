"use client"

import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts"
import type { DatasetSummary } from "@/lib/data-store"

const COLORS = [
  "#f5a623",
  "#2dd4a8",
  "#38bdf8",
  "#f472b6",
  "#a78bfa",
  "#fb923c",
]

const tooltipStyle = {
  backgroundColor: "hsl(0 0% 8%)",
  border: "1px solid hsl(0 0% 16%)",
  borderRadius: "12px",
  fontSize: "11px",
  color: "hsl(42 30% 90%)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  padding: "8px 12px",
}

const axisStyle = {
  fontSize: 10,
  fill: "hsl(42 10% 45%)",
  fontFamily: "var(--font-space-grotesk)",
}

interface EquipmentChartsProps {
  summary: DatasetSummary
}

export function EquipmentCharts({ summary }: EquipmentChartsProps) {
  const barData = summary.data.map((row) => ({
    name: row.name.replace(/-/g, " "),
    Flowrate: row.flowrate,
    Pressure: row.pressure * 10,
    Temperature: row.temperature,
  }))

  const pieData = Object.entries(summary.typeDistribution).map(([name, value]) => ({
    name,
    value,
  }))
  const total = pieData.reduce((s, d) => s + d.value, 0)

  const areaData = summary.data.map((row, idx) => ({
    index: idx + 1,
    name: row.name.replace(/-/g, " "),
    Flowrate: row.flowrate,
    Pressure: row.pressure,
    Temperature: row.temperature,
  }))

  // Radar data: average values by type
  const radarData = Object.keys(summary.typeDistribution).map((type) => {
    const items = summary.data.filter((d) => d.type === type)
    return {
      type,
      Flowrate: Math.round(items.reduce((s, r) => s + r.flowrate, 0) / items.length),
      Pressure: Math.round((items.reduce((s, r) => s + r.pressure, 0) / items.length) * 10),
      Temperature: Math.round(items.reduce((s, r) => s + r.temperature, 0) / items.length),
    }
  })

  const cardClass = "rounded-2xl border border-border/40 bg-card/50 backdrop-blur overflow-hidden"

  return (
    <div className="flex flex-col gap-5">
      {/* Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
        className={cardClass}
      >
        <div className="flex items-center justify-between border-b border-border/30 px-5 py-4">
          <div>
            <h3 className="font-serif text-base italic text-foreground">Parameter Comparison</h3>
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">All equipment readings</p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            {[
              { label: "Flowrate", color: COLORS[0] },
              { label: "Pressure x10", color: COLORS[1] },
              { label: "Temp", color: COLORS[2] },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-5">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 5, left: -15, bottom: 50 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="hsl(0 0% 14%)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={axisStyle}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  axisLine={{ stroke: "hsl(0 0% 14%)" }}
                  tickLine={false}
                />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(36 100% 50% / 0.03)" }} />
                <Bar dataKey="Flowrate" fill={COLORS[0]} radius={[6, 6, 0, 0]} maxBarSize={20} />
                <Bar dataKey="Pressure" fill={COLORS[1]} radius={[6, 6, 0, 0]} maxBarSize={20} />
                <Bar dataKey="Temperature" fill={COLORS[2]} radius={[6, 6, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Donut */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={cardClass}
        >
          <div className="border-b border-border/30 px-5 py-4">
            <h3 className="font-serif text-base italic text-foreground">Type Distribution</h3>
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Equipment categories</p>
          </div>
          <div className="p-5">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                    label={({ cx, cy, midAngle, outerRadius: oR, name, value }) => {
                      const RADIAN = Math.PI / 180
                      const radius = (oR as number) + 18
                      const x = (cx as number) + radius * Math.cos(-midAngle * RADIAN)
                      const y = (cy as number) + radius * Math.sin(-midAngle * RADIAN)
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="hsl(42 20% 70%)"
                          textAnchor={x > (cx as number) ? "start" : "end"}
                          dominantBaseline="central"
                          fontSize={10}
                          fontWeight={500}
                        >
                          {`${name} ${Math.round((value / total) * 100)}%`}
                        </text>
                      )
                    }}
                    labelLine={{ stroke: "hsl(0 0% 20%)", strokeWidth: 1 }}
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {pieData.map((entry, index) => (
                <span
                  key={entry.name}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/30 bg-muted/30 px-2.5 py-1"
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-[10px] text-muted-foreground">{entry.name}</span>
                  <span className="text-[10px] font-semibold text-foreground">{entry.value}</span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Radar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cardClass}
        >
          <div className="border-b border-border/30 px-5 py-4">
            <h3 className="font-serif text-base italic text-foreground">Type Radar Profile</h3>
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Avg values by equipment type</p>
          </div>
          <div className="p-5">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="hsl(0 0% 16%)" />
                  <PolarAngleAxis dataKey="type" tick={{ fontSize: 10, fill: "hsl(42 10% 50%)" }} />
                  <Radar name="Flowrate" dataKey="Flowrate" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="Pressure" dataKey="Pressure" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.1} strokeWidth={2} />
                  <Radar name="Temp" dataKey="Temperature" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.1} strokeWidth={2} />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex justify-center gap-4">
              {[
                { label: "Flowrate", color: COLORS[0] },
                { label: "Pressure", color: COLORS[1] },
                { label: "Temp", color: COLORS[2] },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Area Chart - full width */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={cardClass}
      >
        <div className="border-b border-border/30 px-5 py-4">
          <h3 className="font-serif text-base italic text-foreground">Parameter Trends</h3>
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Sequential values across all entries</p>
        </div>
        <div className="p-5">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 5, right: 5, left: -15, bottom: 50 }}>
                <defs>
                  <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[2]} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={COLORS[2]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="hsl(0 0% 14%)" vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} angle={-45} textAnchor="end" height={60} axisLine={{ stroke: "hsl(0 0% 14%)" }} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="Flowrate" stroke={COLORS[0]} strokeWidth={2} fill="url(#gF)" dot={{ r: 2.5, fill: COLORS[0], strokeWidth: 0 }} activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(0 0% 8%)" }} />
                <Area type="monotone" dataKey="Pressure" stroke={COLORS[1]} strokeWidth={1.5} fill="url(#gP)" dot={{ r: 2, fill: COLORS[1], strokeWidth: 0 }} activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(0 0% 8%)" }} />
                <Area type="monotone" dataKey="Temperature" stroke={COLORS[2]} strokeWidth={1.5} fill="url(#gT)" dot={{ r: 2, fill: COLORS[2], strokeWidth: 0 }} activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(0 0% 8%)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex justify-center gap-4">
            {[
              { label: "Flowrate", color: COLORS[0] },
              { label: "Pressure", color: COLORS[1] },
              { label: "Temperature", color: COLORS[2] },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
