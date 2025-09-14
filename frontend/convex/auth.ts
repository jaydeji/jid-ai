import { convexAuth } from '@convex-dev/auth/server'
import { Password } from '@convex-dev/auth/providers/Password'

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    // Password,
    Password({
      profile(params, _ctx) {
        return {
          email: params.email as string,
          username: params.username as string, // add custom param here to be used
        }
      },
    }),
  ],
})
