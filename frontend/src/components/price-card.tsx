import { memo } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/helpers/other'
import { useUser } from '@/services/react-query/hooks'

export const PriceCard = memo(({ currency = '$' }: { currency?: string }) => {
  const data = useUser()

  return data.data ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge className="bg-muted">{`${currency}${formatPrice(data.data.credits)}`}</Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{data.data.credits}</p>
      </TooltipContent>
    </Tooltip>
  ) : null
})
