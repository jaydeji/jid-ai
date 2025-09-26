import * as React from 'react'
import { Copy } from '../Copy'
import { Card, CardContent } from './card'
import type { Chat } from '@/types'
import { cn } from '@/lib/utils'
import { extractTextFromParts } from '@/helpers/other'
import { useIsMobile } from '@/hooks/use-mobile'

interface UsageStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: Partial<Chat>
  showEmpty?: boolean
}

export function UsageStats({ data, className, ...props }: UsageStatsProps) {
  if (!data) return null

  const { inputTokens, outputTokens, totalTokens, totalCost } = data

  const isMobile = useIsMobile()

  return (
    <div className={cn('w-full max-w-2xl mx-auto mb-1')} {...props}>
      <Card className=" border-0 py-1 bg-transparent">
        <CardContent className="px-2 py-0 flex justify-between items-center">
          <div
            className={cn(
              'flex items-center justify-between text-xs text-foreground',
            )}
          >
            <span className="whitespace-pre">
              {!isMobile && `Input ${inputTokens} | Output ${outputTokens} | `}
              {`Total ${totalTokens} tokens | `}
            </span>
            <span>
              Cost: ${isMobile ? `${Number(totalCost).toFixed(3)}` : totalCost}
            </span>
          </div>
          <Copy
            full
            text={
              data.messages
                ?.map((m) => {
                  const textContent = extractTextFromParts(m.parts)
                  if (!textContent) return null

                  const roleLabel = m.role === 'user' ? 'User' : 'Assistant'
                  const timestamp = new Date(m.createdAt).toLocaleString()

                  return `${roleLabel} (${timestamp}): ${textContent}`
                })
                .filter(Boolean) // Remove null entries
                .join('\n\n') || ''
            }
            title="copy all"
          />
        </CardContent>
      </Card>
    </div>
  )
}
