import { router, protectedProcedure } from "../trpc";

export const categoryRouter = router({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findMany();
  }),
});
