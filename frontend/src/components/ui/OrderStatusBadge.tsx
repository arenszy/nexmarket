import { cn } from '@/lib/utils'
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '@/lib/utils'

export default function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('text-xs font-medium px-2 py-1 rounded-full', ORDER_STATUS_COLOR[status] || 'text-gray-600 bg-gray-50')}>
      {ORDER_STATUS_LABEL[status] || status}
    </span>
  )
}
