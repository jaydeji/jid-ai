import { useMemo, useState } from 'react'
import { Grid } from 'react-window'
import type { CellComponentProps } from 'react-window'
import type { OpenModel } from '@/types'
import { Input } from '@/components/ui/input'

import { useModels } from '@/services/react-query/hooks'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatNumber } from '@/helpers/api'
import { Copy } from '@/components/Copy'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

type KnownModality = 'text' | 'image' | 'file' | 'audio'
type ModalityType = KnownModality | (string & {})

const Modality = ({ modality }: { modality: Array<ModalityType> }) => {
  const colorMap: Record<string, string> = {
    text: 'text-green-700',
    audio: 'text-red-700',
    image: 'text-blue-700',
    file: 'text-yellow-700',
  }

  return (
    <div className="flex flex-wrap gap-2">
      {modality
        .sort()
        .reverse()
        .map((e) => {
          const className = colorMap[e] ?? 'text-gray'
          return (
            <span className={className} key={e}>
              {e}
            </span>
          )
        })}
    </div>
  )
}

const headers = [
  'Provider',
  'Model',
  'Context',
  'Inputs',
  'Outputs',
  'Input Price',
  'Output Price',
]

function Cell({
  models,
  columnIndex,
  rowIndex,
  style,
  isMobile,
}: CellComponentProps<{
  models: Array<OpenModel & { provider: string }>
  isMobile: boolean
}>) {
  const isHeader = rowIndex === 0

  if (isHeader) {
    return (
      <div
        className="text-foreground h-10 text-left align-middle font-medium whitespace-nowrap flex items-center border-b border-border bg-background sticky top-0 z-10"
        style={style}
      >
        {headers[columnIndex]}
      </div>
    )
  }

  const model = models[rowIndex - 1]

  const getContent = () => {
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
                    <span className="cursor-help underline decoration-dotted">
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
            <Copy
              className={cn('group-hover:block', !isMobile && 'hidden')}
              text={id}
            />
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
  return (
    <div className="truncate border-b flex items-center" style={style}>
      {getContent()}
    </div>
  )
}

const columnWidth = (index: number): number => {
  switch (index) {
    case 0:
      return 225
    case 1:
      return 443
    case 2:
      return 113
    case 3:
      return 222
    case 4:
      return 122
    case 5:
      return 182
    case 6:
      return 182
    default:
      return 100
  }
}

export const ModelsPage = () => {
  const [search, setSearch] = useState('')
  const { data } = useModels()
  const isMobile = useIsMobile()

  const filteredModels = useMemo(() => {
    if (!data) return []
    return data.models.filter((m) =>
      m.id.toLowerCase().includes(search.toLowerCase()),
    )
  }, [data, search])

  if (!data) return null

  return (
    <main className="p-6 flex-1 min-h-0 flex flex-col h-full overflow-hidden">
      <div className="mb-4 flex items-center justify-between sticky top-0 z-10 bg-background">
        <h1 className="text-xl font-bold">All Models</h1>
        <Input
          placeholder="Search models..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
      </div>

      <div className=" overflow-hidden text-sm">
        <div className="h-full">
          <Grid
            cellComponent={Cell}
            cellProps={{ models: filteredModels, isMobile }}
            columnCount={7}
            columnWidth={columnWidth}
            rowCount={filteredModels.length + 1} // +1 for header row
            rowHeight={(rowIndex) => (rowIndex === 0 ? 40 : 37)} // Header slightly taller
          />
        </div>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredModels.length} of {data.models.length} models
      </div>
    </main>
  )
}
