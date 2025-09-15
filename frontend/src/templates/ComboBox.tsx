import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

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

export function ComboBox({ model, onSelect }: any) {
  const [open, setOpen] = React.useState(false)

  const { data } = useModels()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className=" justify-between"
        >
          {model && data
            ? data.models.find((m) => m.id === model)?.id
            : 'Select model...'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[150px] p-0">
        <Command>
          <CommandInput placeholder="Search models..." className="h-9" />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            {data &&
              data.keys.map((id) => (
                <CommandGroup key={id} heading={id}>
                  {data.groupedModels[id].map((m) => (
                    <CommandItem
                      key={m.id}
                      value={m.id}
                      onSelect={(currentValue) => {
                        onSelect(currentValue === model ? '' : currentValue)
                        setOpen(false)
                      }}
                    >
                      <div className="flex-1">
                        <div className="truncate font-medium">{m.name}</div>
                        <div className="text-xs  flex gap-3">
                          <span className="truncate">
                            In: {formatNumber({ price: m.pricing.prompt })}
                          </span>
                          <span className="truncate">
                            Out: {formatNumber({ price: m.pricing.completion })}
                          </span>
                        </div>
                      </div>
                      <Check
                        className={cn(
                          'ml-auto',
                          model === m.id ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
