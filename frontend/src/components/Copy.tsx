import { Copy as C, Check, FileText } from 'lucide-react'
import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { copy } from '@/helpers/other'
import { cn } from '@/lib/utils'

export const Copy = ({
  text,
  className,
  full = false,
  title,
}: {
  text: string
  className?: string
  full?: boolean
  title?: string
}) => {
  const [state, setState] = useState(false)

  if (!text) return null

  const Comp = state ? Check : full ? FileText : C

  const onDone = () => {
    setState(true)
    setTimeout(() => {
      setState(false)
    }, 1000)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Comp
          size={12}
          className={cn('cursor-pointer', className)}
          onClick={() => (state ? null : copy(text, onDone))}
        />
      </TooltipTrigger>
      {title && (
        <TooltipContent>
          <p>{title}</p>
        </TooltipContent>
      )}
    </Tooltip>
  )
}
