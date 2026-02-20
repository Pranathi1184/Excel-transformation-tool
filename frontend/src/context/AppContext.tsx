/**
 * App-wide state for multi-page flow: upload, preview, pipeline, results.
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { UploadResponse, MultipleUploadResponse, MergeFilesResponse, TransformResponse, Operation } from '@/lib/api'

type ProcessingMode = 'separate' | 'merge' | 'batch'

interface AppState {
  // Single-file flow
  uploadData: UploadResponse | null
  selectedSheet: string
  operations: Operation[]
  transformResult: TransformResponse | null
  // Multi-file flow
  multipleFiles: UploadResponse[]
  processingMode: ProcessingMode | null
  mergedFile: MergeFilesResponse | null
  // Batch result
  batchResult: { zipUrl?: string; results?: Array<{ fileName: string; rowCountBefore: number; rowCountAfter: number }> } | null
}

interface AppContextValue extends AppState {
  setUploadData: (d: UploadResponse | null) => void
  setSelectedSheet: (s: string) => void
  setOperations: (o: Operation[]) => void
  setTransformResult: (r: TransformResponse | null) => void
  setMultipleFiles: (f: UploadResponse[]) => void
  setProcessingMode: (m: ProcessingMode | null) => void
  setMergedFile: (m: MergeFilesResponse | null) => void
  setBatchResult: (r: AppState['batchResult']) => void
  onSingleUpload: (data: UploadResponse) => void
  onMultipleUpload: (data: MultipleUploadResponse) => void
  onMergeSuccess: (merged: MergeFilesResponse) => void
  clearFlow: () => void
}

const defaultState: AppState = {
  uploadData: null,
  selectedSheet: '',
  operations: [],
  transformResult: null,
  multipleFiles: [],
  processingMode: null,
  mergedFile: null,
  batchResult: null,
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState)

  const setUploadData = useCallback((d: UploadResponse | null) => {
    setState((s) => ({ ...s, uploadData: d }))
  }, [])
  const setSelectedSheet = useCallback((sheet: string) => {
    setState((prev) => ({ ...prev, selectedSheet: sheet }))
  }, [])
  const setOperations = useCallback((o: Operation[]) => {
    setState((s) => ({ ...s, operations: o }))
  }, [])
  const setTransformResult = useCallback((r: TransformResponse | null) => {
    setState((s) => ({ ...s, transformResult: r }))
  }, [])
  const setMultipleFiles = useCallback((f: UploadResponse[]) => {
    setState((s) => ({ ...s, multipleFiles: f }))
  }, [])
  const setProcessingMode = useCallback((m: ProcessingMode | null) => {
    setState((s) => ({ ...s, processingMode: m }))
  }, [])
  const setMergedFile = useCallback((m: MergeFilesResponse | null) => {
    setState((s) => ({ ...s, mergedFile: m }))
  }, [])
  const setBatchResult = useCallback((r: AppState['batchResult']) => {
    setState((s) => ({ ...s, batchResult: r }))
  }, [])

  const onSingleUpload = useCallback((data: UploadResponse) => {
    setState((s) => ({
      ...s,
      uploadData: data,
      multipleFiles: [],
      processingMode: null,
      mergedFile: null,
      selectedSheet: data.sheets[0] || '',
      operations: [],
      transformResult: null,
      batchResult: null,
    }))
  }, [])

  const onMultipleUpload = useCallback((data: MultipleUploadResponse) => {
    if (data.files.length === 1) {
      setState((s) => ({
        ...s,
        uploadData: data.files[0],
        multipleFiles: [],
        processingMode: null,
        selectedSheet: data.files[0].sheets[0] || '',
        operations: [],
        transformResult: null,
        batchResult: null,
      }))
    } else {
      setState((s) => ({
        ...s,
        uploadData: null,
        multipleFiles: data.files,
        mergedFile: null,
        batchResult: null,
      }))
    }
  }, [])

  const onMergeSuccess = useCallback((merged: MergeFilesResponse) => {
    setState((s) => ({
      ...s,
      mergedFile: merged,
      uploadData: {
        fileId: merged.mergedFileId,
        fileName: merged.fileName,
        sheets: merged.sheets,
      },
      multipleFiles: [],
      processingMode: null,
      selectedSheet: merged.sheets[0] || '',
      operations: [],
      transformResult: null,
      batchResult: null,
    }))
  }, [])

  const clearFlow = useCallback(() => {
    setState(defaultState)
  }, [])

  const value: AppContextValue = {
    ...state,
    setUploadData,
    setSelectedSheet,
    setOperations,
    setTransformResult,
    setMultipleFiles,
    setProcessingMode,
    setMergedFile,
    setBatchResult,
    onSingleUpload,
    onMultipleUpload,
    onMergeSuccess,
    clearFlow,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
