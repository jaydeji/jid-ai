import { useEffect, useMemo, useRef, useState } from 'react'
import type { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu'
import type { GroupedModels, Model } from '@/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useModels } from '@/services/react-query/hooks'
import { formatNumber } from '@/helpers/api'

type Checked = DropdownMenuCheckboxItemProps['checked']

function RowComponent({
  model,
  onSelect,
  value,
}: {
  model: Model
  onSelect: (value: string) => void
  value: string
}) {
  return (
    <DropdownMenuCheckboxItem
      key={model.id}
      className="cursor-pointer w-full pl-10"
      onSelect={() => onSelect(model.id)}
      checked={value === model.id}
    >
      <div className="flex-1">
        <div className="truncate font-medium">{model.id}</div>
        <div className="text-xs text-slate-500 flex gap-3">
          <span className="truncate">
            In: {formatNumber({ price: model.input_price })}
          </span>
          <span className="truncate">
            Out: {formatNumber({ price: model.output_price })}
          </span>
        </div>
      </div>
    </DropdownMenuCheckboxItem>
  )
}

export function DropdownMenuCheckboxes({ model, onSelect, value }: any) {
  const [showStatusBar, setShowStatusBar] = useState<Checked>(false)
  const [showActivityBar, setShowActivityBar] = useState<Checked>(false)
  const [showPanel, setShowPanel] = useState<Checked>(false)

  const { data, isFetching: isModelsFetching } = useModels()
  const [query, setQuery] = useState('')

  const filteredModels = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    if (!q) return data.models
    return data.models.filter((m) => String(m.id).toLowerCase().includes(q))
  }, [data, query])

  const filteredData = useMemo(() => {
    if (!data) return undefined
    return {
      ...data,
      models: filteredModels,
    }
  }, [data, filteredModels])

  if (isModelsFetching) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="capitalize">
          {model}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="h-96 relative">
        <div className="px-3 pt-2">
          <DropdownMenuLabel>Models</DropdownMenuLabel>

          <div className="mt-2 flex items-center gap-2">
            <input
              type="search"
              placeholder="Search models..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded border px-2 py-1 text-sm"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-sm px-2 py-1 rounded bg-slate-100"
              >
                x
              </button>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <div
          className="overflow-y-auto"
          style={{ height: 'calc(100% - 88px)' }}
        >
          {filteredData && filteredData.models.length > 0 ? (
            <div className="flex flex-col">
              {filteredData.models.map((m) => (
                <RowComponent
                  key={m.id}
                  model={m}
                  onSelect={onSelect}
                  value={value}
                />
              ))}
            </div>
          ) : (
            <div className="p-3 text-sm text-slate-500">No results.</div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
