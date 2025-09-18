import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'

import './styles.css'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import reportWebVitals from './reportWebVitals.ts'

import { ChatProvider } from './components/chat-context.tsx'
import { queryClient } from '@/services/react-query/hooks.ts'
import { router } from '@/routes/index.tsx'

const persister = createAsyncStoragePersister({
  storage: window.localStorage,
})

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
        onSuccess={() => {
          // resume mutations after initial restore from localStorage was successful
          queryClient.resumePausedMutations().then(() => {
            queryClient.invalidateQueries()
          })
        }}
      >
        <ChatProvider>
          <RouterProvider router={router} />
        </ChatProvider>
        ;
      </PersistQueryClientProvider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
