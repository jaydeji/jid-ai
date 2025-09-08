import {
  Link,
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { queryClient } from '@/services'
import App from '@/App'
import { ModelsPage } from '@/pages/Models'

const rootRoute = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => (
    <>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
})

const modelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/models',
  component: function About() {
    return <ModelsPage />
  },
})

const chatRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/chats/$chatId',
  component: App,
})

const routeTree = rootRoute.addChildren([indexRoute, chatRoute, modelsRoute])

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  context: {
    queryClient,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export { router }
