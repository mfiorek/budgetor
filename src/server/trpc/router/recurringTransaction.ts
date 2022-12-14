import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import dateStringHelper from "../../../utils/dateStringsHelper";

/**
 * Adds one month to the date. Day of the result is equal to passed dayOfMonth or last day of month if desired does not exist.
 * @param date Date we want to mutate by changing month
 * @param dayOfMonth Desired day of month
 */
const addOneMonth = (date: Date, dayOfMonth: number) => {
  const previousDate = new Date(date);
  date.setMonth(date.getMonth() + 1);
  date.setTime(new Date(`${date.getFullYear()}-${dateStringHelper.getMonthString(date)}-${dateStringHelper.getDayString(date)}`).getTime());

  // Handling situation when dayOfMonth does not exist in month:
  if (date.getDate() !== dayOfMonth) {
    // Day did not exist in the next month and we landed on the month after next
    // (i.e. previousDate: 31.01, date after adding 1 month: 03.03)
    // setting date to the last day of the next mont:
    if (date.getMonth() - previousDate.getMonth() > 1) {
      const tempDate = new Date(date.getFullYear(), date.getMonth(), 0);
      date.setMonth(tempDate.getMonth());
      date.setDate(tempDate.getDate());
      console.log("recurring.dayOfMonth does NOT exist in the next month - setting to the last day of month - ", date);
    }
    // In previous iteration we set day to the last day of the month (i.e. 28.02), after adding one month now we are on the wrong day
    // (i.e. previousDate 28.02, date after adding 1 month 28.03 - instead of 31.03)
    // setting date to the correct day:
    else {
      date.setDate(dayOfMonth);
      console.log("recurring.dayOfMonth does exist in the next month - ", date);
    }
  }
};

export const recurringTransactionRouter = router({
  check: protectedProcedure.query(async ({ ctx }) => {
    const transactions = await ctx.prisma.transaction.findMany();
    const recurrings = await ctx.prisma.recurringTransaction.findMany();
    const now = new Date();
    let numberOfAddedTransactions = 0;

    recurrings.forEach(async (recurring) => {
      console.log(`\n=== Checking if recurringTransaction '${recurring.name}' (id: ${recurring.id}) needs to be added ===`);
      const datesToAddNew = [];
      const transactionsFromRecurring = transactions.filter((transaction) => transaction.recurringTransactionId === recurring.id);
      const { dayOfMonth, updatedAt } = recurring;

      const date = new Date(`${updatedAt.getFullYear()}-${dateStringHelper.getMonthString(updatedAt)}-${dayOfMonth < 10 ? `0${dayOfMonth}` : dayOfMonth}`);
      console.log("First generated date: ", date);
      if (date.getTime() < updatedAt.getTime()) {
        addOneMonth(date, dayOfMonth);
        console.log("First generated date was before updatedAt so changing date to: ", date);
      }

      while (updatedAt.getTime() < date.getTime() && date.getTime() < now.getTime()) {
        console.log("*** Starting while-loop with date: ", date);
        const isAlreadyExisting = transactionsFromRecurring.some((t) => t.date.getFullYear() === date.getFullYear() && t.date.getMonth() === date.getMonth());
        isAlreadyExisting ? console.log("[ ] Already exist this month") : console.log("[x] Adding new with date: ", date);
        if (!isAlreadyExisting) {
          datesToAddNew.push(new Date(date));
        }
        addOneMonth(date, dayOfMonth);
      }
      numberOfAddedTransactions += datesToAddNew.length;

      const { id, isExpense, name, categoryId, value, isFX, fxRate, fxSymbol } = recurring;
      await ctx.prisma.transaction.createMany({
        data: datesToAddNew.map((date) => ({
          isExpense,
          name,
          categoryId,
          date,
          value,
          isFX,
          fxRate,
          fxSymbol,
          recurringTransactionId: id,
        })),
      });
    });

    return numberOfAddedTransactions;
  }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.recurringTransaction.findMany({
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
        dayOfMonth: z.number(),
        categoryId: z.string().nullable(),
        value: z.number(),
        isFX: z.boolean(),
        fxRate: z.number(),
        fxSymbol: z.string().nullable(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, isExpense, name, categoryId, dayOfMonth, value, isFX, fxRate, fxSymbol } = input;
      return ctx.prisma.recurringTransaction.upsert({
        where: {
          id,
        },
        update: {
          isExpense,
          name,
          categoryId,
          dayOfMonth,
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
          dayOfMonth,
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
      return ctx.prisma.recurringTransaction.delete({
        where: {
          id,
        },
      });
    }),
});
