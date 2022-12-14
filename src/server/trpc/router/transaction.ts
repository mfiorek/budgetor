import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

export const transactionRouter = router({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.transaction.findMany({
      include: {
        category: true,
      },
    });
  }),
  upsert: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isExpense: z.boolean(),
        name: z.string(),
        date: z.date(),
        categoryId: z.string().nullable(),
        value: z.number(),
        isFX: z.boolean(),
        fxRate: z.number(),
        fxSymbol: z.string().nullable(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, isExpense, name, categoryId, date, value, isFX, fxRate, fxSymbol } = input;
      return ctx.prisma.transaction.upsert({
        where: {
          id,
        },
        update: {
          isExpense,
          name,
          categoryId,
          date,
          value,
          isFX,
          fxRate,
          fxSymbol,
        },
        create: {
          id,
          isExpense,
          name,
          categoryId,
          date,
          value,
          isFX,
          fxRate,
          fxSymbol,
        },
      });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id } = input;
      return ctx.prisma.transaction.delete({
        where: {
          id,
        },
      });
    }),
});
