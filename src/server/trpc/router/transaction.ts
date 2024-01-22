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
  getDistinctDates: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.transaction.findMany({
      select: {
        date: true,
      },
      distinct: "date",
    });
  }),
  getSums: protectedProcedure
    .input(
      z.object({
        periodStart: z.date(),
        periodEnd: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { periodEnd, periodStart } = input;
      const incomePromise = ctx.prisma.transaction.aggregate({
        _sum: {
          value: true,
        },
        where: {
          AND: [
            {
              isExpense: false,
            },
            {
              date: {
                gte: periodStart,
              },
            },
            {
              date: {
                lt: periodEnd,
              },
            },
          ],
        },
      });
      const expensePromise = ctx.prisma.transaction.aggregate({
        _sum: {
          value: true,
        },
        where: {
          AND: [
            {
              isExpense: true,
            },
            {
              date: {
                gte: periodStart,
              },
            },
            {
              date: {
                lt: periodEnd,
              },
            },
          ],
        },
      });
      const [income, expense] = await Promise.all([incomePromise, expensePromise]);

      return {
        income,
        expense,
      };
    }),
  getSumsGroupedByCategories: protectedProcedure
    .input(
      z.object({
        periodStart: z.date(),
        periodEnd: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { periodEnd, periodStart } = input;
      const sumsByCategoriesPromise = await ctx.prisma.transaction.groupBy({
        // TODO add new column in transaction table with string MM-YYYY and group by it (also use it as distinct in getDistinctDates)
        // by: ["categoryId", "monthYearString"],
        by: ["categoryId"],
        _sum: {
          value: true,
        },
        where: {
          AND: [
            {
              date: {
                gte: periodStart,
              },
            },
            {
              date: {
                lt: periodEnd,
              },
            },
          ],
        },
      });
      const categoriesPromise = await ctx.prisma.category.findMany({
        select: {
          id: true,
          name: true,
        },
        distinct: ["id"],
      });

      const [sumsByCategories, categories] = await Promise.all([sumsByCategoriesPromise, categoriesPromise]);
      return sumsByCategories.map((group) => ({ sum: group._sum.value, categoryName: categories.find((category) => category.id === group.categoryId)?.name }));
    }),
  getInfiniteFiltered: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.string().nullish(),
        search: z.string(),
        periodStart: z.date(),
        periodEnd: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, search, periodEnd, periodStart } = input;
      const items = await ctx.prisma.transaction.findMany({
        take: limit + 1,
        include: {
          category: true,
        },
        where: {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              category: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          ],
          AND: [
            {
              date: {
                gte: periodStart,
              },
            },
            {
              date: {
                lt: periodEnd,
              },
            },
          ],
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          date: "desc",
        },
      });
      const nextCursor = items.length > limit ? items.pop()?.id : undefined;
      return {
        items,
        nextCursor,
      };
    }),
  // getInfiniteAll: protectedProcedure
  //   .input(
  //     z.object({
  //       limit: z.number().min(1).max(100).nullish(),
  //       cursor: z.string().nullish(),
  //     })
  //   )
  //   .query(async ({ ctx, input }) => {
  //     const { cursor } = input;
  //     const limit = input.limit ?? 50;
  //     const items = await ctx.prisma.transaction.findMany({
  //       take: limit + 1, // get an extra item at the end which we'll use as next cursor
  //       include: {
  //         category: true,
  //       },
  //       cursor: cursor ? { id: cursor } : undefined,
  //       orderBy: {
  //         date: "desc",
  //       },
  //     });
  //     let nextCursor: typeof cursor | undefined = undefined;
  //     if (items.length > limit) {
  //       const nextItem = items.pop();
  //       nextCursor = nextItem!.id;
  //     }
  //     return {
  //       items,
  //       nextCursor,
  //     };
  //   }),
  // getFiltered: protectedProcedure
  //   .input(
  //     z.object({
  //       search: z.string(),
  //     })
  //   )
  //   .query(({ ctx, input }) => {
  //     const { search } = input;
  //     return ctx.prisma.transaction.findMany({
  //       include: {
  //         category: true,
  //       },
  //       where: {
  //         OR: [
  //           {
  //             name: {
  //               contains: search,
  //               mode: "insensitive",
  //             },
  //           },
  //           {
  //             category: {
  //               name: {
  //                 contains: search,
  //                 mode: "insensitive",
  //               },
  //             },
  //           },
  //         ],
  //       },
  //     });
  //   }),
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
