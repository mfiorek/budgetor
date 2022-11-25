import { useState } from "react";
import { type NextPage, type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { trpc } from "../utils/trpc";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import MonthSelector from "../components/MonthSelector";
import Doughnut from "../components/Doughnut";
import TransactionListElement from "../components/TransactionListElement";
import Link from "next/link";

const Home: NextPage = () => {
  const [periodStart, setPeriodStart] = useState<Date>(new Date(`${new Date().getFullYear()}-${new Date().getMonth() + 1}`));
  const [periodEnd, setPeriodEnd] = useState<Date>(new Date(`${new Date().getFullYear()}-${new Date().getMonth() + 2}`));

  const { data: transactionsData, isLoading: isTransactionsLoading } = trpc.transaction.getAll.useQuery(undefined, { staleTime: 1000 * 60 * 5 });
  const { data: categoriesData, isLoading: isCategoriesLoading } = trpc.category.getAll.useQuery(undefined, { staleTime: 1000 * 60 * 5 });

  if (isTransactionsLoading || isCategoriesLoading || !transactionsData || !categoriesData) {
    return (
      <Layout>
        <Loader text="Loading transactions..." />
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <MonthSelector transactions={transactionsData} setPeriodStart={setPeriodStart} setPeriodEnd={setPeriodEnd} />
        <Doughnut
          income={transactionsData
            .filter((t) => !t.isExpense)
            .filter((t) => t.date.getTime() >= periodStart.getTime() && t.date.getTime() < periodEnd.getTime())
            .map((t) => t.value)
            .reduce((partialSum, a) => partialSum + a, 0)}
          expense={transactionsData
            .filter((t) => t.isExpense)
            .filter((t) => t.date.getTime() >= periodStart.getTime() && t.date.getTime() < periodEnd.getTime())
            .map((t) => t.value)
            .reduce((partialSum, a) => partialSum + a, 0)}
        />
      </div>
      <div className="flex w-full justify-end">
        <Link href="/transaction">
          <button className="my-4 rounded bg-lime-700 px-3 py-1 font-semibold hover:bg-lime-600">Add</button>
        </Link>
      </div>
      <ul className="flex w-full flex-col gap-2 rounded-md bg-slate-700 bg-opacity-20 p-1">
        <li className="flex w-full rounded bg-slate-700 py-2 pr-8 font-extrabold">
          <span className="w-1/4 px-2">Name</span>
          <span className="w-1/4 px-2">Category</span>
          <span className="w-1/4 px-2 text-right">Value</span>
          <span className="w-1/4 px-2 text-right">Date</span>
        </li>
        {transactionsData
          .filter((transaction) => transaction.date.getTime() >= periodStart.getTime() && transaction.date.getTime() < periodEnd.getTime())
          .sort((a, b) => b.date.getTime() - a.date.getTime() || b.createdAt.getTime() - a.createdAt.getTime())
          .map((transaction) => (
            <TransactionListElement key={transaction.id} transaction={transaction} />
          ))}
      </ul>
    </Layout>
  );
};

export default Home;

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
