import { router } from "../trpc";
import { categoryRouter } from "./category";
import { recurringTransactionRouter } from "./recurringTransaction";
import { transactionRouter } from "./transaction";
import { userRouter } from "./user";

export const appRouter = router({
  transaction: transactionRouter,
  recurringTransaction: recurringTransactionRouter,
  category: categoryRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
