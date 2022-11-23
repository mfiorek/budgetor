import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const categoryRouter = router({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findMany();
  }),
  add: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string(),
        iconSrc: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, name, color, iconSrc } = input;
      return ctx.prisma.category.create({
        data: {
          id,
          name,
          color,
          iconSrc,
        },
      });
    }),
});