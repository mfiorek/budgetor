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
        iconSrc: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, name, color, iconSrc } = input;
      return ctx.prisma.category.upsert({
        where: {
          id
        },
        update: {
          name,
          color,
          iconSrc,
        },
        create: {
          id,
          name,
          color,
          iconSrc,
        },
      });
    }),
});
