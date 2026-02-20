import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface SkeletonPipelineProps {
  cards?: number
  className?: string
}

export function SkeletonPipeline({ cards = 3, className }: SkeletonPipelineProps) {
  return (
    <div className={className ?? 'space-y-3'}>
      {Array.from({ length: cards }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-3 w-full max-w-[200px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
