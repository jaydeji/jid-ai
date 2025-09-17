import ky from 'ky'
import { config } from './config'
import { getAuthHeader } from './auth'

import type { KyInstance } from 'ky'

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
            } else {
              // ensure header is removed when not logged in
              request.headers.delete('Authorization')
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
    return this.api.post<T>(path, body).json()
  }
}

export { MyFetch }
