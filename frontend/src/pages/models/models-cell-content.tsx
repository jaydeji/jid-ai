import { useState } from 'react'
import { Info } from 'lucide-react'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const ModelName = ({ name }: { name: string }) => {
  return (
    <span className="md:cursor-help md:underline md:decoration-dotted">
      {name}
    </span>
  )
}

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
              <>
                <span className="hidden md:inline">
                  <Tooltip>
                    <TooltipTrigger>
                      <ModelName name={name} />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{description}</p>
                    </TooltipContent>
                  </Tooltip>
                </span>
                <span className="inline md:hidden">
                  <span className="flex items-center gap-1">
                    <ModelName name={name} />

                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label="More info"
                          className="md:hidden p-1 rounded-full hover:bg-muted"
                        >
                          <Info size={12} className="text-foreground" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="max-w-xs">
                        <span className="text-xs ">{description}</span>
                      </PopoverContent>
                    </Popover>
                  </span>
                </span>
              </>
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
