import * as React from 'react'
import { Copy } from '../Copy'
import { Card, CardContent } from './card'
import type { Chat } from '@/types'
import { cn } from '@/lib/utils'

interface UsageStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: Partial<Chat>
  showEmpty?: boolean
}

export function UsageStats({ data, className, ...props }: UsageStatsProps) {
  if (!data) return null

  const { inputTokens, outputTokens, totalTokens, totalCost } = data

  return (
    <div className={cn('w-full max-w-2xl mx-auto px-4')} {...props}>
      <Card className="bg-muted/50 border-0 py-3">
        <CardContent className="px-4 py-0">
          <div className="flex items-center justify-between text-xs text-foreground">
            <span>
              {`Input ${inputTokens} | Output ${outputTokens} | Total ${totalTokens} tokens`}
            </span>
            <span>Cost: ${totalCost}</span>
          </div>
          <Copy text={JSON.stringify(data.messages)} />
        </CardContent>
      </Card>
    </div>
  )
}
