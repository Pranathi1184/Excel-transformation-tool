import { useState, useCallback } from 'react'

export type ViewMode = 'overview' | 'configuring' | 'reviewing'

export interface ViewState {
  mode: ViewMode
  selectedOperationType: string | null
  editingOperationIndex: number | null
  drawerOpen: boolean
  changesPanelOpen: boolean
}

export function useViewState() {
  const [viewState, setViewState] = useState<ViewState>({
    mode: 'overview',
    selectedOperationType: null,
    editingOperationIndex: null,
    drawerOpen: false,
    changesPanelOpen: false,
  })

  const enterConfigurationMode = useCallback((operationType: string, editingIndex: number | null = null) => {
    setViewState({
      mode: 'configuring',
      selectedOperationType: operationType,
      editingOperationIndex: editingIndex,
      drawerOpen: true,
      changesPanelOpen: false,
    })
  }, [])

  const exitConfigurationMode = useCallback(() => {
    setViewState({
      mode: 'overview',
      selectedOperationType: null,
      editingOperationIndex: null,
      drawerOpen: false,
      changesPanelOpen: false,
    })
  }, [])

  const enterReviewMode = useCallback(() => {
    setViewState({
      mode: 'reviewing',
      selectedOperationType: null,
      editingOperationIndex: null,
      drawerOpen: false,
      changesPanelOpen: true,
    })
  }, [])

  const exitReviewMode = useCallback(() => {
    setViewState({
      mode: 'overview',
      selectedOperationType: null,
      editingOperationIndex: null,
      drawerOpen: false,
      changesPanelOpen: false,
    })
  }, [])

  return {
    viewState,
    enterConfigurationMode,
    exitConfigurationMode,
    enterReviewMode,
    exitReviewMode,
  }
}
