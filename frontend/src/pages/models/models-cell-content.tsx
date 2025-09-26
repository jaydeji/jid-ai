import { useState } from 'react'
import { Modality } from './models-modality'
import type { OpenModel } from '@/types'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatNumber } from '@/helpers/api'
import { Copy } from '@/components/Copy'
import { cn } from '@/lib/utils'

export const CellContent = ({
  model,
  columnIndex,
}: {
  model: OpenModel & { provider: string }
  columnIndex: number
}) => {
  const [open, setOpen] = useState(false)

  const {
    id,
    name,
    description,
    pricing,
    context_length,
    architecture,
    provider,
  } = model

  switch (columnIndex) {
    case 0:
      return <div className="font-medium">{provider}</div>
    case 1:
      return (
        <div className="flex items-center gap-2">
          <span id={`${id}`}>
            {description.length ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help no-underline md:underline md:decoration-dotted">
                    {name}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{description}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              name
            )}
          </span>
          <Copy className={cn('group-hover:block')} text={id} />
        </div>
      )
    case 2:
      return <div>{context_length.toLocaleString()}</div>
    case 3:
      return <Modality modality={architecture.input_modalities} />
    case 4:
      return <Modality modality={architecture.output_modalities} />
    case 5:
      return <div> {formatNumber({ price: pricing.prompt })}</div>
    case 6:
      return <div> {formatNumber({ price: pricing.completion })}</div>

    default:
      return null
  }
}
