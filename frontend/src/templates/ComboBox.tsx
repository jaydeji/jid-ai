import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { List } from 'react-window'
import type { RowComponentProps } from 'react-window'

import type { Model } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useModels } from '@/services/react-query/hooks'
import { formatNumber } from '@/helpers/api'

type Item = { type: 'key'; name: string } | (Model & { type: 'model' })
type RowProps = {
  items: Array<Item>
  onSelect: (value: string) => void
  model: string
}

function rowHeight(index: number, { items }: RowProps) {
  switch (items[index].type) {
    case 'key': {
      return 32
    }
    case 'model': {
      return 56
    }
  }
}

const Row = ({
  index,
  style,
  items,
  onSelect,
  model,
}: RowComponentProps<RowProps>) => {
  const item = items[index]

  if (item.type === 'key') {
    return (
      <div
        style={style}
        className="flex items-center px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50 border-b border-border/50 sticky top-0 z-10"
      >
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-[#2cb67d]" />
          <span className="uppercase tracking-wide">{item.name}</span>
        </div>
      </div>
    )
  }

  const isSelected = model === item.id

  return (
    <div style={style} className="px-1">
      <CommandItem
        key={item.id}
        value={item.id}
        onSelect={(currentValue) => {
          onSelect(currentValue === model ? '' : currentValue)
        }}
        className={cn(
          'flex items-center gap-3 px-3 py-2 mx-1 my-0.5 rounded-md cursor-pointer transition-all duration-150',
          'hover:bg-accent/80 hover:text-accent-foreground',
          'focus:bg-accent focus:text-accent-foreground',
          'data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
          isSelected && 'bg-accent/50 shadow-sm',
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="font-medium text-sm truncate">{item.name}</div>
            <Check
              className={cn(
                'h-4 w-4 shrink-0 transition-opacity',
                isSelected ? 'opacity-100 text-primary' : 'opacity-0',
              )}
            />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-medium tracking-wide opacity-60">
                In:
              </span>
              <span className="font-mono">
                {formatNumber({ price: item.pricing.prompt })}
              </span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-medium tracking-wide opacity-60">
                Out:
              </span>
              <span className="font-mono">
                {formatNumber({ price: item.pricing.completion })}
              </span>
            </div>
          </div>
        </div>
      </CommandItem>
    </div>
  )
}

export function ComboBox({ model, onSelect }: any) {
  const [open, setOpen] = React.useState(false)
  const { data } = useModels()
  const [search, setSearch] = React.useState('')

  const items: Array<Item> =
    data?.keys.flatMap((key) => [
      { type: 'key' as const, name: key },
      ...data.groupedModels[key].map(
        (m: Model): Item => ({
          ...m,
          type: 'model',
        }),
      ),
    ]) ?? []

  const filteredItems = React.useMemo(() => {
    if (!search.trim()) return items

    const lower = search.toLowerCase()
    return items.filter((item) => {
      if (item.type === 'key') return item.name.toLowerCase().includes(lower)
      return (
        item.name.toLowerCase().includes(lower) ||
        item.id.toLowerCase().includes(lower)
      )
    })
  }, [items, search])

  const selectedModel = data?.models.find((m: any) => m.id === model)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-40 justify-between h-10 px-3 font-normal"
        >
          <span className="truncate">
            {selectedModel?.name || 'Select model...'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[380px] p-0 shadow-lg" align="start">
        <Command className="rounded-lg border-0 h-[320px]">
          <div className="border-b border-border/50">
            <CommandInput
              placeholder="Search models..."
              className="h-10 px-3 text-sm border-0 focus:ring-0"
              value={search}
              onValueChange={setSearch}
            />
          </div>

          <div className="max-h-[320px] overflow-hidden">
            {filteredItems.length === 0 ? (
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                No models found.
              </CommandEmpty>
            ) : (
              <List
                rowComponent={Row}
                rowCount={filteredItems.length}
                rowHeight={rowHeight}
                rowProps={{
                  items: filteredItems,
                  onSelect: (...args) => {
                    setOpen(false)
                    onSelect(...args)
                  },
                  model,
                }}
                className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
              />
            )}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
