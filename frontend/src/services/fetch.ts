import ky from 'ky'
import { config } from './config'

import type { KyInstance } from 'ky'

class MyFetch {
  api: KyInstance

  constructor() {
    this.api = ky.extend({
      prefixUrl: config.VITE_API_URL,
      retry: 0,
      //   hooks: {
      //     beforeRequest: [
      //       (request) => {
      //         // request.headers.set('X-Requested-With', 'ky')
      //       },
      //     ],
      //   },
    })
  }

  get = <T>(path: string) => {
    return this.api.get<T>(path).json()
  }
}

export { MyFetch }
