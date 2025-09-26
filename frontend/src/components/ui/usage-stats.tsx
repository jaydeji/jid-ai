import { memo, useMemo } from 'react'
import { Copy } from '../Copy'
import { Card, CardContent } from './card'
import { cn } from '@/lib/utils'
import { extractTextFromParts } from '@/helpers/other'
import { useIsMobile } from '@/hooks/use-mobile'
import { useMyChat } from '@/services/react-query/hooks'

interface UsageStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  showEmpty?: boolean
}

const Cost = memo(() => {
  const isMobile = useIsMobile()
  const { totalCost } = useMyChat()

  return (
    <span>
      Cost: ${isMobile ? `${Number(totalCost).toFixed(3)}` : totalCost}
    </span>
  )
})

export function UsageStats({ className, ...props }: UsageStatsProps) {
  const { serverMessages, inputTokens, outputTokens, totalTokens } = useMyChat()

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
              <span className="hidden md:inline">
                Input {inputTokens} | Output {outputTokens} |{' '}
              </span>
              {`Total ${totalTokens} tokens | `}
            </span>
            <Cost />
          </div>
          <Copy
            full
            text={
              serverMessages
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

// UsageStats.whyDidYouRender = true
