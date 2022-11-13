import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

export const transactionRouter = router({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.transaction.findMany();
  }),
  add: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        date: z.date(),
        category: z.string(),
        value: z.number(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { name, category, date, value } = input;
      return ctx.prisma.transaction.create({
        data: {
          name,
          category,
          date,
          value,
        },
      });
    }),
});
