import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'

export default defineSchema({
  ...authTables,
  users: defineTable({
    email: v.optional(v.string()),

    // Custom field.
    username: v.string(),
  }).index('username', ['username']),
})
