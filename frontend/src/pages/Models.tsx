import { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useModels } from '@/services/react-query/hooks'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatNumber } from '@/helpers/api'

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
    <TableCell>
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
    </TableCell>
  )
}

export const ModelsPage = () => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { data, isFetching: isModelsFetching } = useModels()

  if (!data) return null

  const models = selectedProvider ? data.groupedModels[selectedProvider] : []

  const filteredModels = models.filter((m) =>
    m.id.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex ">
      {/* Sidebar */}
      <aside className="w-64 border-r p-4 overflow-scroll h-screen">
        <h2 className="mb-2 font-semibold">Providers</h2>
        <Accordion type="single" collapsible>
          {data.keys.map((provider) => (
            <AccordionItem key={provider} value={provider}>
              <AccordionTrigger
                onClick={() => setSelectedProvider(provider)}
                className="cursor-pointer"
              >
                {provider}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  {data.groupedModels[provider].length} models
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 h-screen overflow-scroll">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            {selectedProvider
              ? `${selectedProvider} Models`
              : 'Select a provider'}
          </h1>
          {selectedProvider && (
            <Input
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          )}
        </div>

        {selectedProvider && (
          <TooltipProvider>
            <Table className="">
              <TableHeader>
                <TableRow>
                  <TableHead>Model ID</TableHead>
                  <TableHead>Context</TableHead>
                  <TableHead>Inputs</TableHead>
                  <TableHead>Outputs</TableHead>
                  <TableHead>Input Price</TableHead>
                  <TableHead>Output Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModels.map(
                  ({
                    id,
                    description,
                    pricing,
                    context_length,
                    architecture,
                  }) => (
                    <TableRow key={id}>
                      <TableCell>
                        {description.length ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help underline decoration-dotted">
                                {id}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{description}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          id
                        )}
                      </TableCell>
                      <TableCell>{context_length.toLocaleString()}</TableCell>
                      <TableCell>
                        <Modality modality={architecture.input_modalities} />
                      </TableCell>
                      <TableCell>
                        <Modality modality={architecture.output_modalities} />
                      </TableCell>
                      <TableCell>
                        {formatNumber({ price: pricing.prompt })}
                      </TableCell>
                      <TableCell>
                        {formatNumber({ price: pricing.completion })}
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </TooltipProvider>
        )}
      </main>
    </div>
  )
}
