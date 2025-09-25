import { Copy as C } from 'lucide-react'
import { copy } from '@/helpers/other'
import { cn } from '@/lib/utils'

export const Copy = ({
  text,
  className,
}: {
  text: string
  className?: string
}) => {
  return (
    <C
      size={12}
      className={cn('cursor-pointer', className)}
      onClick={() => copy(text)}
    />
  )
}
