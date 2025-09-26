import { headers } from './models-helper'
import type { CellComponentProps } from 'react-window'

export const Header = ({
  columnIndex,
  style,
}: {
  columnIndex: number
  style: CellComponentProps['style']
}) => {
  return (
    <div
      className="text-foreground h-10 text-left align-middle font-medium whitespace-nowrap flex items-center border-b border-border bg-background sticky top-0 z-10"
      style={style}
    >
      {headers[columnIndex]}
    </div>
  )
}
