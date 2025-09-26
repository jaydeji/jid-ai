import { Grid } from 'react-window'
import { Cell } from './models-cell'
import { columnWidth, useModel } from './models-helper'
import { Input } from '@/components/ui/input'

export const ModelsPage = () => {
  const { data, search, setSearch, filteredModels } = useModel()

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
            cellProps={{ models: filteredModels }}
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
