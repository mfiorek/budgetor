import { useRouter } from "next/router";
import { trpc } from "../utils/trpc";

export function useTrpcSession({ authRequired = false, notAuthRequired = false, redirectTo = "/login" }) {
  const router = useRouter();
  const query = trpc.user.getSession.useQuery(undefined, {
    onSettled(data) {
      if (!data && authRequired) return router.push(redirectTo);
      if (!!data && notAuthRequired) return router.push(redirectTo);
    },
  });
  return query;
}
