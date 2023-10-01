import { currentUser } from '@clerk/nextjs';
import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { z } from 'zod';

export const appRouter = router({
    authCallback: publicProcedure.query(async () => {
        const user = await currentUser()

        if (!user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' })

        const dbUser = await db.user.findFirst({
            where: {
                id: user.id
            }
        })
        if (!dbUser) {
            await db.user.create({
                data: {
                    id: user.id
                }
            })
        }
        return { success: true }
    }),

    getTodo: privateProcedure.query(async ({ ctx }) => {
        const { userId } = ctx
        return await db.todo.findMany({
            where: {
                userId
            }
        })
    }),

    deleteTodo: privateProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx

            const todo = await db.todo.findFirst({
                where: {
                    id: input.id,
                    userId
                }
            })

            if (!todo) throw new TRPCError({ code: 'NOT_FOUND' })

            await db.todo.delete({
                where: {
                    id: input.id,
                }
            })
        }),

    addTodo: privateProcedure
        .input(
            z.object({
                text: z.string(),
                completed: z.boolean()
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            const newTodo = await db.todo.create({
                data: {
                    text: input.text,
                    completed: false,
                    userId,
                },
            })

            return newTodo;
        }),

    updateTodo: privateProcedure
        .input(
            z.object({
                id: z.number(),
                completed: z.boolean()
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            const updatedTodo = await db.todo.update({
                where: {
                    id: input.id,
                    userId,

                },
                data: {
                    completed: input.completed
                },
            })

            return updatedTodo;
        })

});

export type AppRouter = typeof appRouter;