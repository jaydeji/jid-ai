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
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useModels } from '@/services/react-query/hooks'
import { formatNumber } from '@/helpers/api'

// Reuse your domain Model type from service
// Example: type Model = { id: string; name: string; pricing: { prompt: number; completion: number }; }

type Item = { type: 'key'; name: string } | (Model & { type: 'model' })
type RowProps = {
  items: Array<Item>
  onSelect: (value: string) => void
  model: string
}

function rowHeight(index: number, { items }: RowProps) {
  switch (items[index].type) {
    case 'key': {
      return 30
    }
    case 'model': {
      return 40
    }
  }
}

// Row renderer
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
      <CommandGroup
        heading={item.name}
        style={style}
        className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted"
      ></CommandGroup>
    )
  }

  return (
    <CommandItem
      key={item.id}
      value={item.id}
      onSelect={(currentValue) => {
        onSelect(currentValue === model ? '' : currentValue)
        // setOpen(false)
      }}
      style={style}
    >
      <div className="flex-1">
        <div className="truncate font-medium">{item.name}</div>
        <div className="text-xs flex gap-3">
          <span className="truncate">
            In: {formatNumber({ price: item.pricing.prompt })}
          </span>
          <span className="truncate">
            Out: {formatNumber({ price: item.pricing.completion })}
          </span>
        </div>
      </div>
      <Check
        className={cn(
          'ml-auto',
          model === item.id ? 'opacity-100' : 'opacity-0',
        )}
      />
    </CommandItem>
  )
}

export function ComboBox({ model, onSelect }: any) {
  const [open, setOpen] = React.useState(false)
  const { data } = useModels()

  // Flatten group structure -> one virtualized list
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {model && data
            ? data.models.find((m: any) => m.id === model)?.id
            : 'Select model...'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="min-w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search models..." className="h-9" />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            {items.length > 0 && (
              <List
                rowComponent={Row}
                rowCount={items.length}
                rowHeight={rowHeight}
                rowProps={{ items, onSelect, model }}
              />
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
