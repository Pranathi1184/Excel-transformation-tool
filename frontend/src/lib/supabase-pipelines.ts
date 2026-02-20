/**
 * Supabase functions for saving and loading pipelines
 */
import { supabase, getCurrentUserId, isSupabaseConfigured } from './supabase'
import type { SavedPipeline } from './supabase'
import { toast } from 'sonner'
import type { Operation } from './api'

// Re-export SavedPipeline type
export type { SavedPipeline }

/**
 * Save a pipeline to Supabase (or localStorage fallback)
 */
export async function savePipeline(
  name: string,
  operations: Operation[],
  description?: string
): Promise<SavedPipeline | null> {
  // Fallback to localStorage if Supabase not configured
  if (!isSupabaseConfigured() || !supabase) {
    return savePipelineLocalStorage(name, operations, description)
  }

  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      toast.error('Please sign in to save pipelines')
      return null
    }

    const { data, error } = await supabase
      .from('saved_pipelines')
      .insert([
        {
          user_id: userId,
          name,
          description: description || '',
          operations,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Save pipeline error:', error)
      toast.error('Failed to save pipeline: ' + error.message)
      // Fallback to localStorage
      return savePipelineLocalStorage(name, operations, description)
    }

    toast.success('Pipeline saved to cloud!')
    return data
  } catch (error) {
    console.error('Save pipeline exception:', error)
    toast.error('Failed to save pipeline')
    // Fallback to localStorage
    return savePipelineLocalStorage(name, operations, description)
  }
}

/**
 * Load all pipelines from Supabase (or localStorage fallback)
 */
export async function loadPipelines(): Promise<SavedPipeline[]> {
  // Fallback to localStorage if Supabase not configured
  if (!isSupabaseConfigured() || !supabase) {
    return loadPipelinesLocalStorage()
  }

  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      // Not signed in, return empty array
      return []
    }

    const { data, error } = await supabase
      .from('saved_pipelines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Load pipelines error:', error)
      // Fallback to localStorage
      return loadPipelinesLocalStorage()
    }

    return data || []
  } catch (error) {
    console.error('Load pipelines exception:', error)
    // Fallback to localStorage
    return loadPipelinesLocalStorage()
  }
}

/**
 * Load a single pipeline by ID (Supabase or localStorage)
 */
export async function loadPipelineById(pipelineId: string): Promise<SavedPipeline | null> {
  if (!pipelineId) return null
  // Try localStorage first (for local_* ids)
  const local = loadPipelinesLocalStorage()
  const fromLocal = local.find((p) => p.id === pipelineId)
  if (fromLocal) return fromLocal
  // Try Supabase
  if (!isSupabaseConfigured() || !supabase) return null
  try {
    const userId = await getCurrentUserId()
    if (!userId) return null
    const { data, error } = await supabase
      .from('saved_pipelines')
      .select('*')
      .eq('id', pipelineId)
      .eq('user_id', userId)
      .maybeSingle()
    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

/**
 * Delete a pipeline from Supabase (or localStorage fallback)
 */
export async function deletePipeline(pipelineId: string): Promise<boolean> {
  // Fallback to localStorage if Supabase not configured
  if (!isSupabaseConfigured() || !supabase) {
    return deletePipelineLocalStorage(pipelineId)
  }

  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      toast.error('Please sign in to delete pipelines')
      return false
    }

    const { error } = await supabase.from('saved_pipelines').delete().eq('id', pipelineId).eq('user_id', userId)

    if (error) {
      console.error('Delete pipeline error:', error)
      toast.error('Failed to delete pipeline')
      return false
    }

    toast.success('Pipeline deleted')
    return true
  } catch (error) {
    console.error('Delete pipeline exception:', error)
    toast.error('Failed to delete pipeline')
    return false
  }
}

/**
 * Update a pipeline in Supabase
 */
export async function updatePipeline(
  pipelineId: string,
  name: string,
  operations: Operation[],
  description?: string
): Promise<SavedPipeline | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return updatePipelineLocalStorage(pipelineId, name, operations, description)
  }

  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      toast.error('Please sign in to update pipelines')
      return null
    }

    const { data, error } = await supabase
      .from('saved_pipelines')
      .update({
        name,
        description: description || '',
        operations,
      })
      .eq('id', pipelineId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Update pipeline error:', error)
      toast.error('Failed to update pipeline')
      return null
    }

    toast.success('Pipeline updated')
    return data
  } catch (error) {
    console.error('Update pipeline exception:', error)
    toast.error('Failed to update pipeline')
    return null
  }
}

// LocalStorage fallback functions
function savePipelineLocalStorage(
  name: string,
  operations: Operation[],
  description?: string
): SavedPipeline | null {
  try {
    const existing = loadPipelinesLocalStorage()
    const pipeline: SavedPipeline = {
      id: `local_${Date.now()}`,
      user_id: 'local',
      name,
      description,
      operations,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    existing.push(pipeline)
    localStorage.setItem('savedPipelines', JSON.stringify(existing))
    toast.success('Pipeline saved locally')
    return pipeline
  } catch (error) {
    console.error('LocalStorage save error:', error)
    return null
  }
}

function loadPipelinesLocalStorage(): SavedPipeline[] {
  try {
    const stored = localStorage.getItem('savedPipelines')
    if (!stored) return []
    return JSON.parse(stored)
  } catch (error) {
    console.error('LocalStorage load error:', error)
    return []
  }
}

function deletePipelineLocalStorage(pipelineId: string): boolean {
  try {
    const existing = loadPipelinesLocalStorage()
    const filtered = existing.filter((p) => p.id !== pipelineId)
    localStorage.setItem('savedPipelines', JSON.stringify(filtered))
    toast.success('Pipeline deleted')
    return true
  } catch (error) {
    console.error('LocalStorage delete error:', error)
    return false
  }
}

function updatePipelineLocalStorage(
  pipelineId: string,
  name: string,
  operations: Operation[],
  description?: string
): SavedPipeline | null {
  try {
    const existing = loadPipelinesLocalStorage()
    const index = existing.findIndex((p) => p.id === pipelineId)
    if (index === -1) return null

    existing[index] = {
      ...existing[index],
      name,
      description,
      operations,
      updated_at: new Date().toISOString(),
    }
    localStorage.setItem('savedPipelines', JSON.stringify(existing))
    toast.success('Pipeline updated locally')
    return existing[index]
  } catch (error) {
    console.error('LocalStorage update error:', error)
    return null
  }
}
