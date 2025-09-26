import './wdyr'

import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'

import './styles.css'
import { QueryClientProvider } from '@tanstack/react-query'
import reportWebVitals from './reportWebVitals.ts'

import { TooltipProvider } from './components/ui/tooltip.tsx'
import { queryClient } from '@/services/react-query/queryClient.ts'
import { router } from '@/routes/index.tsx'
import { Toaster } from '@/components/ui/sonner'

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <TooltipProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </TooltipProvider>
      <Toaster richColors />
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
