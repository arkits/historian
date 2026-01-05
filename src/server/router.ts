import { router, publicProcedure, protectedProcedure } from "./trpc";
import { auth } from "./auth";

export const appRouter = router({
  getSession: publicProcedure.query(async ({ ctx }) => {
    const session = await auth.api.getSession({
      headers: ctx.headers,
    });
    return session;
  }),

  signOut: publicProcedure.mutation(async ({ ctx }) => {
    const result = await auth.api.signOut({
      headers: ctx.headers,
    });
    return result;
  }),

  getUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session.user;
  }),
});

export type AppRouter = typeof appRouter;
