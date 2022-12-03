import React from "react";
import { type NextPage, type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { trpc } from "../utils/trpc";
import { formatNumber } from "../utils/currencyFormat";
import Layout from "../components/Layout";
import Loader from "../components/Loader";

const RecurringPage: NextPage = () => {
  const { data: recurringsData, isLoading: isRecurringsLoading } = trpc.recurringTransaction.getAll.useQuery(undefined, { staleTime: 1000 * 60 * 5 });

  if (isRecurringsLoading || !recurringsData) {
    return (
      <Layout>
        <Loader text="Loading transactions..." />
      </Layout>
    );
  }
  return (
    <Layout>
      <ul className="flex w-full flex-col gap-2">
        <li className="flex w-full rounded bg-slate-700 py-2 font-extrabold">
          <span className="w-1/4 px-2">Name</span>
          <span className="w-1/4 px-2">Category</span>
          <span className="w-1/4 px-2 text-right">Value</span>
          <span className="w-1/4 px-2 text-right">Day of month</span>
        </li>
        {recurringsData.map((recurring) => (
          <li key={recurring.id} className="flex w-full flex-col items-center rounded bg-slate-700 bg-opacity-50">
            <div className={`flex w-full py-2`}>
              <span className="w-1/4 px-2">{recurring.name}</span>
              <span className="w-1/4 px-2">
                {recurring.category ? (
                  <>
                    {recurring.category.icon} {recurring.category.name}
                  </>
                ) : (
                  <>-</>
                )}
              </span>
              <span className={`w-1/4 px-2 text-right ${recurring.isExpense ? "text-red-400" : "text-lime-500"}`}>
                {formatNumber((recurring.isExpense ? -1 : 1) * recurring.value)} zł
              </span>
              <span className="w-1/4 px-2 text-right">{recurring.dayOfMonth}</span>
            </div>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default RecurringPage;

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(context);
  if (!session?.user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
};
