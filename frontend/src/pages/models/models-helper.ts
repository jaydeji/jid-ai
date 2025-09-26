import { useMemo, useState } from 'react'
import { useModels } from '@/services/react-query/hooks'

export const headers = [
  'Provider',
  'Model',
  'Context',
  'Inputs',
  'Outputs',
  'Input Price',
  'Output Price',
]

export const columnWidth = (index: number): number => {
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

export const useModel = () => {
  const [search, setSearch] = useState('')
  const { data } = useModels()

  const filteredModels = useMemo(() => {
    if (!data) return []
    return data.models.filter((m) =>
      m.id.toLowerCase().includes(search.toLowerCase()),
    )
  }, [data, search])

  return { data, search, setSearch, filteredModels }
}
