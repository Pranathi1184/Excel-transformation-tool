/**
 * Keyboard shortcuts cheat sheet dialog. Triggered by "?" key or help menu.
 */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
interface ShortcutItem {
  keys: string[]
  description: string
}

interface ShortcutSection {
  title: string
  items: ShortcutItem[]
}

const SHORTCUTS: ShortcutSection[] = [
  {
    title: 'Global',
    items: [
      { keys: ['Ctrl', 'K'], description: 'Open command palette' },
      { keys: ['Ctrl', 'Z'], description: 'Undo last operation' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo operation' },
      { keys: ['Ctrl', 'S'], description: 'Save pipeline' },
      { keys: ['Esc'], description: 'Close dialogs' },
    ],
  },
  {
    title: 'Pipeline',
    items: [
      { keys: ['Ctrl', 'Enter'], description: 'Run & preview' },
      { keys: ['Ctrl', 'V'], description: 'Validate pipeline' },
      { keys: ['Delete'], description: 'Delete selected operation' },
      { keys: ['Ctrl', '↑'], description: 'Move operation up' },
      { keys: ['Ctrl', '↓'], description: 'Move operation down' },
      { keys: ['E'], description: 'Edit selected operation' },
    ],
  },
]

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-xs font-medium">
      {children}
    </kbd>
  )
}

export interface KeyboardShortcutsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Press <Kbd>?</Kbd> to toggle this dialog.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-2">
          {SHORTCUTS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 text-sm font-semibold text-foreground">{section.title}</h3>
              <div className="space-y-2">
                {section.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">{item.description}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      {item.keys.map((k, j) => (
                        <span key={j} className="flex items-center gap-0.5">
                          {j > 0 && <span className="text-muted-foreground">+</span>}
                          <Kbd>{k}</Kbd>
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="border-t border-border pt-3 text-center text-xs text-muted-foreground">
          Press ? to toggle this dialog
        </p>
      </DialogContent>
    </Dialog>
  )
}
