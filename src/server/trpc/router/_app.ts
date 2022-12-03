import { router } from "../trpc";
import { categoryRouter } from "./category";
import { recurringTransactionRouter } from "./recurringTransaction";
import { transactionRouter } from "./transaction";

export const appRouter = router({
  transaction: transactionRouter,
  recurringTransaction: recurringTransactionRouter,
  category: categoryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
