import { NextResponse } from "next/server"
import { getDataset, deleteDataset } from "@/lib/data-store"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dataset = getDataset(id)
  if (!dataset) {
    return NextResponse.json({ error: "Dataset not found" }, { status: 404 })
  }
  return NextResponse.json(dataset)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deleted = deleteDataset(id)
  if (!deleted) {
    return NextResponse.json({ error: "Dataset not found" }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
