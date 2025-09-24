import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'
import type { Usage } from '@/types'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/helpers/other'

interface UsageStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: Partial<Usage>
  showEmpty?: boolean
}

export function UsageStats({
  data,
  showEmpty = false,
  className,
  ...props
}: UsageStatsProps) {
  // If no data and we shouldn't show empty state, don't render anything
  if (!showEmpty && !data) {
    return null
  }

  // Use empty object if data is undefined
  data = data || {}

  const {
    inputTokens = 0,
    outputTokens = 0,
    totalTokens = 0,
    totalCost = 0,
  } = data

  return (
    <div className={cn('w-full', className)} {...props}>
      <Card className="bg-muted/50 border-0 py-3">
        <CardContent className="px-4 py-0">
          <div className="flex items-center justify-between text-xs text-foreground">
            <span>
              {`Input ${inputTokens} | Output ${outputTokens} | Total ${totalTokens} tokens`}
            </span>
            <span>Cost: ${totalCost}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// export function UsageStats({
//   data,
//   showEmpty = false,
//   className,
//   ...props
// }: UsageStatsProps) {
//   // If no data and we shouldn't show empty state, don't render anything
//   if (!showEmpty && !data) {
//     return null
//   }

//   // Use empty object if data is undefined
//   data = data || {}

//   const {
//     inputTokens = 0,
//     outputTokens = 0,
//     totalTokens = 0,
//     totalCost = 0,
//   } = data

//   // Format the cost to always show 5 decimal places
//   const formattedCost = Number(totalCost).toFixed(5)

//   return (
//     <div className={cn('w-full', className)} {...props}>
//       <Card className="bg-muted/50 border-0 py-3">
//         <CardHeader className="px-4 py-0 mb-0 pb-2">
//           <CardTitle className="text-sm font-medium">
//             Usage Statistics
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="px-4 py-0">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
//             <div className="flex flex-col items-center">
//               <span className="text-xs text-muted-foreground">
//                 Input Tokens
//               </span>
//               <span className="font-medium">
//                 {inputTokens.toLocaleString()}
//               </span>
//             </div>
//             <div className="flex flex-col items-center">
//               <span className="text-xs text-muted-foreground">
//                 Output Tokens
//               </span>
//               <span className="font-medium">
//                 {outputTokens.toLocaleString()}
//               </span>
//             </div>
//             <div className="flex flex-col items-center">
//               <span className="text-xs text-muted-foreground">
//                 Total Tokens
//               </span>
//               <span className="font-medium">
//                 {totalTokens.toLocaleString()}
//               </span>
//             </div>
//             <div className="flex flex-col items-center">
//               <span className="text-xs text-muted-foreground">Cost</span>
//               <span className="font-medium">${formattedCost}</span>
//             </div>
//           </div>
//         </CardContent>
//         <CardFooter className="px-4 py-2 mt-1 text-xs text-muted-foreground justify-center">
//           <div className="flex items-center gap-2">
//             <div className="h-2 w-2 rounded-full bg-green-500"></div>
//             <span>Optimized to reduce cost while maintaining quality</span>
//           </div>
//         </CardFooter>
//       </Card>
//     </div>
//   )
// }
