import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="space-y-2 pb-2">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}
