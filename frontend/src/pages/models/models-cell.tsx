import { Header } from './models-header'
import { CellContent } from './models-cell-content'
import type { OpenModel } from '@/types'
import type { CellComponentProps } from 'react-window'
import { cn } from '@/lib/utils'

export function Cell({
  models,
  columnIndex,
  rowIndex,
  style,
}: CellComponentProps<{
  models: Array<OpenModel & { provider: string }>
}>) {
  if (rowIndex === 0) {
    return <Header columnIndex={columnIndex} style={style} />
  }

  return (
    <div
      className={cn(
        'truncate border-b flex items-center',
        rowIndex % 2 !== 0 && 'bg-card',
      )}
      style={style}
    >
      <CellContent model={models[rowIndex - 1]} columnIndex={columnIndex} />
    </div>
  )
}
