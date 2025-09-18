import ky from 'ky'
import { config } from './config'
import { clearAuth, getAuthHeader } from './auth'

import type { KyInstance } from 'ky'
// import { router } from '@/routes'

class MyFetch {
  api: KyInstance

  constructor() {
    this.api = ky.extend({
      prefixUrl: config.VITE_API_URL,
      retry: 0,
      hooks: {
        beforeRequest: [
          (request) => {
            const header = getAuthHeader()
            if (header) {
              request.headers.set('Authorization', header)
            }
          },
        ],
        afterResponse: [
          async (_request, _options, response) => {
            if (response.status === 401) {
              const { router } = await import('@/routes')
              clearAuth()
              router.navigate({ to: '/login' })
            }
          },
        ],
      },
    })
  }

  get = <T>(path: string) => {
    return this.api.get<T>(path).json()
  }

  post = <T>(path: string, body?: any) => {
    return this.api.post<T>(path, body ? { json: body } : undefined).json()
  }
}

export { MyFetch }
