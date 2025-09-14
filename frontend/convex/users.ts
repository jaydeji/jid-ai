import { getAuthUserId } from '@convex-dev/auth/server'
import { query } from './_generated/server'

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('users').collect()
    // const userId = await getAuthUserId(ctx)
    // return userId !== null ? ctx.db.get(userId) : null
  },
})
