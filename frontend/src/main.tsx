import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'

import './styles.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConvexReactClient } from 'convex/react'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import reportWebVitals from './reportWebVitals.ts'

import { config } from './services/config.ts'
import { queryClient } from '@/services/react-query/hooks.ts'
import { router } from '@/routes/index.tsx'

const convex = new ConvexReactClient(config.VITE_CONVEX_DEP_URL)

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ConvexAuthProvider client={convex}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ConvexAuthProvider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
