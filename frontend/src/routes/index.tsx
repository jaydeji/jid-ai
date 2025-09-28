import {
  Navigate,
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { queryClient } from '@/services'
import App from '@/App'
import { ModelsPage } from '@/pages'
import LoginPage from '@/pages/Login'
import { getAuthHeader, isLoggedIn } from '@/services/auth'
import { ChatPage } from '@/pages/chat/Chat'
import SignupPage from '@/pages/Signup'
import { NotFound } from '@/components/not-found'

const rootRoute = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => (
    <>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  ),
  notFoundComponent: NotFound,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  loader: () => {
    if (getAuthHeader()) throw redirect({ to: '/' })
    return {}
  },
})

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  loader: () => {
    if (getAuthHeader()) throw redirect({ to: '/' })
    return {}
  },
  component: SignupPage,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_pathlessLayout',
  component: function Index() {
    if (!isLoggedIn()) return <Navigate to="/login" replace />
    return <App />
  },
})

const newChatRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/',
  component: ChatPage,
})

const chatRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/chats/$chatId',
  component: ChatPage,
})

const modelsRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/models',
  component: ModelsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute.addChildren([newChatRoute, chatRoute, modelsRoute]),
  loginRoute,
  signUpRoute,
])

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
export type AppRouter = typeof router
