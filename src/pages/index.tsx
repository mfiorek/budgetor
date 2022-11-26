import { useState } from "react";
import { type NextPage, type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { trpc } from "../utils/trpc";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import MonthSelector from "../components/MonthSelector";
import Doughnut from "../components/Doughnut";
import Link from "next/link";
import TanTable from "../components/TanTable";
import TableControls from "../components/TableControls";

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
      <TableControls />
      <TanTable data={transactionsData.filter((transaction) => transaction.date.getTime() >= periodStart.getTime() && transaction.date.getTime() < periodEnd.getTime())} />
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
