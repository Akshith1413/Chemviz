import { NextResponse } from "next/server"
import { addDataset, parseCSV } from "@/lib/data-store"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "File must be a CSV" }, { status: 400 })
    }

    const csvText = await file.text()
    const data = parseCSV(csvText)
    const summary = addDataset(file.name, data)

    return NextResponse.json(summary)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process CSV"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
