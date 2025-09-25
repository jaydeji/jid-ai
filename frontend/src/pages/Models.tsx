import { useState } from 'react'
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
import { Copy } from '@/components/Copy'

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
    <div className="flex-1 flex flex-col h-full bg-background overflow-y-auto">
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
    </div>
  )
}

export const ModelsPage = () => {
  const [search, setSearch] = useState('')
  const { data } = useModels()

  if (!data) return null

  const filteredModels = data.models.filter((m) =>
    m.id.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <main className="p-6 h-screen overflow-scroll">
      {/* Header + Search */}
      <div className="mb-4 flex items-center justify-between sticky top-0 z-20 bg-background">
        <h1 className="text-xl font-bold">All Models</h1>
        <Input
          placeholder="Search models..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
      </div>

      {/* Models Table */}
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Model</TableHead>
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
                name,
                description,
                pricing,
                context_length,
                architecture,
                provider,
              }) => (
                <TableRow key={id} className="group">
                  <TableCell className="font-medium">{provider}</TableCell>
                  <TableCell>
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
                      <Copy className="hidden group-hover:block" text={id} />
                    </div>
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
    </main>
  )
}
