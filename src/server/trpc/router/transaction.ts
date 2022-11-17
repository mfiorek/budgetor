import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

export const transactionRouter = router({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.transaction.findMany();
  }),
  add: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isExpense: z.boolean(),
        name: z.string(),
        date: z.date(),
        category: z.string(),
        value: z.number(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, isExpense, name, category, date, value } = input;
      return ctx.prisma.transaction.create({
        data: {
          id,
          isExpense,
          name,
          category,
          date,
          value,
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
