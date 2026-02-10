import { NextResponse } from "next/server"
import { getDatasets } from "@/lib/data-store"

export async function GET() {
  const datasets = getDatasets()
  // Return summaries without full data to keep response small
  const summaries = datasets.map(({ data: _data, ...rest }) => rest)
  return NextResponse.json(summaries)
}
