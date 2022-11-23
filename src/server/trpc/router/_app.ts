import { router } from "../trpc";
import { categoryRouter } from "./category";
import { transactionRouter } from "./transaction";

export const appRouter = router({
  transaction: transactionRouter,
  category: categoryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
