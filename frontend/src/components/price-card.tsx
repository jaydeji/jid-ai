import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/services/react-query/hooks'

const formatPrice = (n: string) => {
  return (Math.floor(Number(n) * 10) / 10).toFixed(1)
}

export function PriceCard({ currency = '$' }: { currency?: string }) {
  const data = useUser()

  return data.data ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge>{`${currency}${formatPrice(data.data.credits)}`}</Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{data.data.credits}</p>
      </TooltipContent>
    </Tooltip>
  ) : null
}
