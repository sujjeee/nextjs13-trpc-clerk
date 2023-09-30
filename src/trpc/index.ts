import { publicProcedure, router } from './trpc';

export const appRouter = router({
    test: publicProcedure.query(() => {
        return 'hello pro hwo are you ding?? tell me about some yourselft'
    }),
});

export type AppRouter = typeof appRouter;