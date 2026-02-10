export interface EquipmentRow {
  name: string
  type: string
  flowrate: number
  pressure: number
  temperature: number
}

export interface DatasetSummary {
  id: string
  uploadedAt: string
  fileName: string
  totalCount: number
  avgFlowrate: number
  avgPressure: number
  avgTemperature: number
  typeDistribution: Record<string, number>
  data: EquipmentRow[]
}

const MAX_DATASETS = 5

// In-memory store (persists across hot reloads in dev)
const globalStore = globalThis as unknown as {
  __datasets: DatasetSummary[]
}

if (!globalStore.__datasets) {
  // Pre-load with sample data
  const sampleData: EquipmentRow[] = [
    { name: "Pump-1", type: "Pump", flowrate: 120, pressure: 5.2, temperature: 110 },
    { name: "Compressor-1", type: "Compressor", flowrate: 95, pressure: 8.4, temperature: 95 },
    { name: "Valve-1", type: "Valve", flowrate: 60, pressure: 4.1, temperature: 105 },
    { name: "HeatExchanger-1", type: "HeatExchanger", flowrate: 150, pressure: 6.2, temperature: 130 },
    { name: "Pump-2", type: "Pump", flowrate: 132, pressure: 5.6, temperature: 118 },
    { name: "Valve-2", type: "Valve", flowrate: 58, pressure: 4.0, temperature: 102 },
    { name: "Reactor-1", type: "Reactor", flowrate: 140, pressure: 7.5, temperature: 140 },
    { name: "Pump-3", type: "Pump", flowrate: 125, pressure: 5.3, temperature: 115 },
    { name: "Condenser-1", type: "Condenser", flowrate: 160, pressure: 6.8, temperature: 125 },
    { name: "Compressor-2", type: "Compressor", flowrate: 100, pressure: 8.0, temperature: 98 },
    { name: "HeatExchanger-2", type: "HeatExchanger", flowrate: 155, pressure: 6.3, temperature: 132 },
    { name: "Valve-3", type: "Valve", flowrate: 62, pressure: 4.2, temperature: 107 },
    { name: "Pump-4", type: "Pump", flowrate: 130, pressure: 5.9, temperature: 119 },
    { name: "Reactor-2", type: "Reactor", flowrate: 145, pressure: 7.2, temperature: 138 },
    { name: "Condenser-2", type: "Condenser", flowrate: 165, pressure: 6.9, temperature: 128 },
  ]

  const summary = buildSummary("sample_equipment_data.csv", sampleData)
  globalStore.__datasets = [summary]
}

export function getDatasets(): DatasetSummary[] {
  return globalStore.__datasets
}

export function getDataset(id: string): DatasetSummary | undefined {
  return globalStore.__datasets.find((d) => d.id === id)
}

export function addDataset(fileName: string, data: EquipmentRow[]): DatasetSummary {
  const summary = buildSummary(fileName, data)
  globalStore.__datasets.unshift(summary)
  // Keep only the last 5
  if (globalStore.__datasets.length > MAX_DATASETS) {
    globalStore.__datasets = globalStore.__datasets.slice(0, MAX_DATASETS)
  }
  return summary
}

export function deleteDataset(id: string): boolean {
  const idx = globalStore.__datasets.findIndex((d) => d.id === id)
  if (idx === -1) return false
  globalStore.__datasets.splice(idx, 1)
  return true
}

function buildSummary(fileName: string, data: EquipmentRow[]): DatasetSummary {
  const totalCount = data.length
  const avgFlowrate = data.reduce((s, r) => s + r.flowrate, 0) / totalCount
  const avgPressure = data.reduce((s, r) => s + r.pressure, 0) / totalCount
  const avgTemperature = data.reduce((s, r) => s + r.temperature, 0) / totalCount

  const typeDistribution: Record<string, number> = {}
  for (const row of data) {
    typeDistribution[row.type] = (typeDistribution[row.type] || 0) + 1
  }

  return {
    id: crypto.randomUUID(),
    uploadedAt: new Date().toISOString(),
    fileName,
    totalCount,
    avgFlowrate: Math.round(avgFlowrate * 100) / 100,
    avgPressure: Math.round(avgPressure * 100) / 100,
    avgTemperature: Math.round(avgTemperature * 100) / 100,
    typeDistribution,
    data,
  }
}

export function parseCSV(csvText: string): EquipmentRow[] {
  const lines = csvText.trim().split("\n")
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row")

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase())
  const nameIdx = header.findIndex((h) => h.includes("name") || h.includes("equipment"))
  const typeIdx = header.findIndex((h) => h === "type")
  const flowIdx = header.findIndex((h) => h.includes("flow"))
  const pressIdx = header.findIndex((h) => h.includes("press"))
  const tempIdx = header.findIndex((h) => h.includes("temp"))

  if (nameIdx === -1 || typeIdx === -1 || flowIdx === -1 || pressIdx === -1 || tempIdx === -1) {
    throw new Error("CSV must contain columns: Equipment Name, Type, Flowrate, Pressure, Temperature")
  }

  const rows: EquipmentRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim())
    if (cols.length < 5) continue
    rows.push({
      name: cols[nameIdx],
      type: cols[typeIdx],
      flowrate: Number.parseFloat(cols[flowIdx]) || 0,
      pressure: Number.parseFloat(cols[pressIdx]) || 0,
      temperature: Number.parseFloat(cols[tempIdx]) || 0,
    })
  }

  if (rows.length === 0) throw new Error("No valid data rows found in CSV")
  return rows
}
