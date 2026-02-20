/**
 * localStorage helpers for recent transformations and saved pipelines.
 */
import type { Operation } from '@/lib/api'

const RECENT_TRANSFORMATIONS_KEY = 'excel-tool-recent-transformations'
const SAVED_PIPELINES_KEY = 'excel-tool-saved-pipelines'
const CURRENT_DRAFT_KEY = 'excel-tool-current-pipeline-draft'
const MAX_RECENT = 10
const MAX_HISTORY_STATES = 50

export interface RecentTransformation {
  id: string
  fileName: string
  date: string // ISO string
  operationsCount: number
  sheetName?: string
}

/** API-level operations only (no id/summary). */
export interface SavedPipeline {
  id: string
  name: string
  description?: string
  operations: Operation[]
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
}

/** Legacy shape from before description/createdAt/updatedAt (for migration). */
interface LegacySavedPipeline {
  id: string
  name: string
  date?: string
  operations: unknown[]
}

function normalizeSavedPipeline(raw: LegacySavedPipeline | SavedPipeline): SavedPipeline {
  const now = new Date().toISOString()
  return {
    id: raw.id,
    name: raw.name,
    description: 'description' in raw ? raw.description : undefined,
    operations: Array.isArray(raw.operations) ? raw.operations as Operation[] : [],
    createdAt: 'createdAt' in raw ? raw.createdAt : (raw.date ?? now),
    updatedAt: 'updatedAt' in raw ? raw.updatedAt : (raw.date ?? now),
  }
}

export function getRecentTransformations(): RecentTransformation[] {
  try {
    const raw = localStorage.getItem(RECENT_TRANSFORMATIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RecentTransformation[]
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

export function addRecentTransformation(entry: Omit<RecentTransformation, 'id' | 'date'>) {
  const list = getRecentTransformations()
  const newEntry: RecentTransformation = {
    ...entry,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  }
  const next = [newEntry, ...list.filter((r) => r.fileName !== entry.fileName || r.date !== newEntry.date)].slice(0, MAX_RECENT)
  localStorage.setItem(RECENT_TRANSFORMATIONS_KEY, JSON.stringify(next))
}

export function clearRecentTransformations() {
  localStorage.removeItem(RECENT_TRANSFORMATIONS_KEY)
}

export function getSavedPipelines(): SavedPipeline[] {
  try {
    const raw = localStorage.getItem(SAVED_PIPELINES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as (LegacySavedPipeline | SavedPipeline)[]
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeSavedPipeline)
  } catch {
    return []
  }
}

export function savePipeline(name: string, operations: Operation[], description?: string): SavedPipeline {
  const list = getSavedPipelines()
  const now = new Date().toISOString()
  const newEntry: SavedPipeline = {
    id: crypto.randomUUID(),
    name,
    description,
    operations,
    createdAt: now,
    updatedAt: now,
  }
  localStorage.setItem(SAVED_PIPELINES_KEY, JSON.stringify([newEntry, ...list]))
  return newEntry
}

export function loadPipeline(id: string): SavedPipeline | null {
  return getSavedPipelines().find((p) => p.id === id) ?? null
}

export function deletePipeline(id: string) {
  const next = getSavedPipelines().filter((p) => p.id !== id)
  localStorage.setItem(SAVED_PIPELINES_KEY, JSON.stringify(next))
}

/** @deprecated Use deletePipeline. */
export function deleteSavedPipeline(id: string) {
  deletePipeline(id)
}

export function updatePipeline(
  id: string,
  updates: Partial<Pick<SavedPipeline, 'name' | 'description' | 'operations'>>
): SavedPipeline | null {
  const list = getSavedPipelines()
  const index = list.findIndex((p) => p.id === id)
  if (index === -1) return null
  const now = new Date().toISOString()
  const updated: SavedPipeline = {
    ...list[index],
    ...updates,
    updatedAt: now,
  }
  const next = [...list]
  next[index] = updated
  localStorage.setItem(SAVED_PIPELINES_KEY, JSON.stringify(next))
  return updated
}

// --- Draft (auto-save) ---

export interface DraftPipeline {
  operations: Operation[]
  savedAt: string // ISO
}

export function getCurrentDraft(): DraftPipeline | null {
  try {
    const raw = localStorage.getItem(CURRENT_DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DraftPipeline
    if (!parsed?.operations || !Array.isArray(parsed.operations)) return null
    return { operations: parsed.operations, savedAt: parsed.savedAt || new Date().toISOString() }
  } catch {
    return null
  }
}

export function setCurrentDraft(operations: Operation[]) {
  if (operations.length === 0) {
    localStorage.removeItem(CURRENT_DRAFT_KEY)
    return
  }
  localStorage.setItem(
    CURRENT_DRAFT_KEY,
    JSON.stringify({ operations, savedAt: new Date().toISOString() } as DraftPipeline)
  )
}

export function clearCurrentDraft() {
  localStorage.removeItem(CURRENT_DRAFT_KEY)
}

export { MAX_HISTORY_STATES }
