import {
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  useNavigate,
} from '@tanstack/react-router'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { queryClient } from '@/services'
import App from '@/App'
import { ModelsPage } from '@/pages/Models'
import LoginPage from '@/pages/Login'
import { isLoggedIn } from '@/services/auth'
import { Chat } from '@/pages/Chat'
import SignupPage from '@/pages/Signup'

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

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignupPage,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_pathlessLayout',
  component: function Index() {
    const navigate = useNavigate()
    if (!isLoggedIn()) {
      // Redirect to login if not authenticated
      navigate({ to: '/login' })
      return null
    }
    return <App />
  },
})

const newChatRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/',
  component: Chat,
})

const chatRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/chats/$chatId',
  component: Chat,
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
