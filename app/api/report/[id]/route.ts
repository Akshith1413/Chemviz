import { NextResponse } from "next/server"
import { getDataset } from "@/lib/data-store"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dataset = getDataset(id)

  if (!dataset) {
    return NextResponse.json({ error: "Dataset not found" }, { status: 404 })
  }

  // Generate a simple text-based report as downloadable file
  const lines: string[] = []
  lines.push("=" .repeat(60))
  lines.push("CHEMICAL EQUIPMENT PARAMETER REPORT")
  lines.push("=" .repeat(60))
  lines.push("")
  lines.push(`File: ${dataset.fileName}`)
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push(`Upload Date: ${dataset.uploadedAt}`)
  lines.push("")
  lines.push("-".repeat(60))
  lines.push("SUMMARY STATISTICS")
  lines.push("-".repeat(60))
  lines.push(`Total Equipment Count: ${dataset.totalCount}`)
  lines.push(`Average Flowrate: ${dataset.avgFlowrate}`)
  lines.push(`Average Pressure: ${dataset.avgPressure}`)
  lines.push(`Average Temperature: ${dataset.avgTemperature}`)
  lines.push("")
  lines.push("-".repeat(60))
  lines.push("EQUIPMENT TYPE DISTRIBUTION")
  lines.push("-".repeat(60))

  for (const [type, count] of Object.entries(dataset.typeDistribution)) {
    const pct = ((count / dataset.totalCount) * 100).toFixed(1)
    lines.push(`  ${type}: ${count} (${pct}%)`)
  }

  lines.push("")
  lines.push("-".repeat(60))
  lines.push("DETAILED EQUIPMENT DATA")
  lines.push("-".repeat(60))
  lines.push("")

  // Table header
  const header = `${"Equipment Name".padEnd(22)} ${"Type".padEnd(16)} ${"Flowrate".padStart(10)} ${"Pressure".padStart(10)} ${"Temp".padStart(8)}`
  lines.push(header)
  lines.push("-".repeat(header.length))

  for (const row of dataset.data) {
    lines.push(
      `${row.name.padEnd(22)} ${row.type.padEnd(16)} ${String(row.flowrate).padStart(10)} ${String(row.pressure).padStart(10)} ${String(row.temperature).padStart(8)}`
    )
  }

  lines.push("")
  lines.push("=" .repeat(60))
  lines.push("END OF REPORT")
  lines.push("=" .repeat(60))

  const reportText = lines.join("\n")

  return new NextResponse(reportText, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="equipment_report_${dataset.fileName.replace(".csv", "")}.txt"`,
    },
  })
}
