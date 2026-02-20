/**
 * Undo/redo history state and reducer for pipeline operations.
 */
import type { Operation } from '@/lib/api'
import { MAX_HISTORY_STATES } from '@/lib/storage'

export interface PipelineOperation extends Operation {
  id: string
  summary: string
}

export interface HistoryState {
  past: { ops: PipelineOperation[]; label: string }[]
  present: PipelineOperation[]
  future: { ops: PipelineOperation[]; label: string }[]
}

export type HistoryAction =
  | { type: 'ADD_OPERATION'; operation: PipelineOperation; label: string }
  | { type: 'EDIT_OPERATION'; index: number; operation: PipelineOperation; label: string }
  | { type: 'DELETE_OPERATION'; index: number; label: string }
  | { type: 'REORDER_OPERATIONS'; operations: PipelineOperation[]; label: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESTORE_TO'; index: number }
  | { type: 'LOAD_PIPELINE'; operations: PipelineOperation[] }
  | { type: 'CLEAR_PIPELINE' }

function pushPast(state: HistoryState, label: string): { ops: PipelineOperation[]; label: string }[] {
  const next = [...state.past, { ops: state.present, label }]
  if (next.length > MAX_HISTORY_STATES) next.shift()
  return next
}

export const initialHistoryState: HistoryState = {
  past: [],
  present: [],
  future: [],
}

export function pipelineHistoryReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'ADD_OPERATION':
      return {
        past: pushPast(state, action.label),
        present: [...state.present, action.operation],
        future: [],
      }
    case 'EDIT_OPERATION': {
      const next = [...state.present]
      next[action.index] = action.operation
      return {
        past: pushPast(state, action.label),
        present: next,
        future: [],
      }
    }
    case 'DELETE_OPERATION': {
      const next = state.present.filter((_, i) => i !== action.index)
      return {
        past: pushPast(state, action.label),
        present: next,
        future: [],
      }
    }
    case 'REORDER_OPERATIONS':
      return {
        past: pushPast(state, action.label),
        present: action.operations,
        future: [],
      }
    case 'UNDO': {
      if (state.past.length === 0) return state
      const last = state.past[state.past.length - 1]
      return {
        past: state.past.slice(0, -1),
        present: last.ops,
        future: [{ ops: state.present, label: last.label }, ...state.future],
      }
    }
    case 'REDO': {
      if (state.future.length === 0) return state
      const first = state.future[0]
      return {
        past: pushPast(state, first.label),
        present: first.ops,
        future: state.future.slice(1),
      }
    }
    case 'RESTORE_TO': {
      const allOps = [...state.past.map((p) => p.ops), state.present, ...state.future.map((f) => f.ops)]
      const allLabels = [...state.past.map((p) => p.label), 'Current', ...state.future.map((f) => f.label)]
      if (action.index < 0 || action.index >= allOps.length) return state
      const newPresent = allOps[action.index]
      const newPast = allOps.slice(0, action.index).map((ops, j) => ({ ops, label: allLabels[j] }))
      const newFuture = allOps.slice(action.index + 1).map((ops, j) => ({
        ops,
        label: allLabels[action.index + 1 + j],
      }))
      const trimmedPast = newPast.length > MAX_HISTORY_STATES ? newPast.slice(-MAX_HISTORY_STATES) : newPast
      return { past: trimmedPast, present: newPresent, future: newFuture }
    }
    case 'LOAD_PIPELINE':
      return {
        past: [],
        present: action.operations,
        future: [],
      }
    case 'CLEAR_PIPELINE':
      return {
        past: [],
        present: [],
        future: [],
      }
    default:
      return state
  }
}

export function toApiOperations(ops: PipelineOperation[]): Operation[] {
  return ops.map(({ summary, id, ...op }) => op)
}
