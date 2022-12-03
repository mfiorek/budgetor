import { useState } from "react";
import { type NextPage, type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { trpc } from "../utils/trpc";
import Link from "next/link";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import YearSelector from "../components/YearSelector";
import TanTable from "../components/TanTable";
import TableControls from "../components/TableControls";

const YearPage: NextPage = () => {
  const [periodStart, setPeriodStart] = useState<Date>(new Date(`${new Date().getFullYear()}`));
  const [periodEnd, setPeriodEnd] = useState<Date>(new Date(`${new Date().getFullYear() + 1}`));

  const { data: check } = trpc.recurringTransaction.check.useQuery(undefined, { staleTime: 1000 * 60 * 60 * 24 });
  const { data: transactionsData, isLoading: isTransactionsLoading } = trpc.transaction.getAll.useQuery(undefined, { enabled: check !== undefined, staleTime: 1000 * 60 * 5 });
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
        <YearSelector transactions={transactionsData} setPeriodStart={setPeriodStart} setPeriodEnd={setPeriodEnd} />
        Bar chart coming soon...
      </div>
      <div className="flex w-full justify-center py-10">
        <Link href="/transaction" className="flex w-full justify-center gap-2 rounded bg-lime-800 px-3 py-2 font-semibold hover:bg-lime-700 sm:max-w-[10rem]">
          <span>Add new</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
            />
          </svg>
        </Link>
      </div>
      <div className="flex w-full flex-col gap-4">
        <TableControls />
        <TanTable data={transactionsData.filter((transaction) => transaction.date.getTime() >= periodStart.getTime() && transaction.date.getTime() < periodEnd.getTime())} />
      </div>
    </Layout>
  );
};

export default YearPage;

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
