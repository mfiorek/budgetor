import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const categoryRouter = router({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findMany();
  }),
  upsert: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string(),
        icon: z.string(),
        isExpense: z.boolean(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, name, color, icon, isExpense } = input;
      return ctx.prisma.category.upsert({
        where: {
          id,
        },
        update: {
          name,
          color,
          icon,
          isExpense,
        },
        create: {
          id,
          name,
          color,
          icon,
          isExpense,
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
      return ctx.prisma.category.delete({
        where: {
          id,
        },
      });
    }),
});
