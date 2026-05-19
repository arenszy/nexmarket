import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  max?: number
  size?: number
  showValue?: boolean
  className?: string
}

export default function StarRating({ rating, max = 5, size = 14, showValue = false, className }: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' :
            i < rating ? 'fill-yellow-200 text-yellow-400' :
            'fill-gray-200 text-gray-200'
          )}
        />
      ))}
      {showValue && (
        <span className="text-xs text-shopee-text-light ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  )
}
