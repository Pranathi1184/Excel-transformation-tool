/**
 * Contextual help: "?" icon that opens a popover with title, content, and optional "Learn more" link.
 */
import { HelpCircle } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const LEARN_MORE_URL = 'https://example.com/docs'

export interface HelpTooltipProps {
  title: string
  content: string
  /** Optional URL for "Learn more". Defaults to placeholder. */
  learnMoreUrl?: string
  className?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function HelpTooltip({
  title,
  content,
  learnMoreUrl = LEARN_MORE_URL,
  className,
  side = 'top',
}: HelpTooltipProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('h-6 w-6 shrink-0 text-muted-foreground hover:text-[#217346]', className)}
          aria-label="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side={side} className="w-80">
        <div className="space-y-2">
          <p className="font-semibold text-sm text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>
          <a
            href={learnMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-xs text-[#217346] hover:underline"
          >
            Learn more
          </a>
        </div>
      </PopoverContent>
    </Popover>
  )
}
