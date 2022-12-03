import React from "react";
import { type NextPage, type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { trpc } from "../utils/trpc";
import Link from "next/link";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import RecurringListElement from "../components/RecurringListElement";

const RecurringsPage: NextPage = () => {
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
      <div className="flex w-full flex-col gap-8">
        <Link href="/recurring" className="mx-auto flex w-full justify-center gap-2 rounded bg-lime-800 px-3 py-2 font-semibold hover:bg-lime-700 sm:max-w-[10rem]">
          <span>Add new</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
            />
          </svg>
        </Link>

        {/* Recurring expenses */}
        <div className="flex w-full flex-col gap-4">
          <h3 className="text-2xl">Recurring expenses:</h3>
          <ul className="flex w-full flex-col gap-2 rounded bg-red-600 bg-opacity-10 p-1">
            <li className="flex w-full rounded bg-slate-700 py-2 pr-10 font-extrabold">
              <span className="w-1/4 px-2">Name</span>
              <span className="w-1/4 px-2">Category</span>
              <span className="w-1/4 px-2 text-right">Value</span>
              <span className="w-1/4 px-2 text-right">Day of month</span>
            </li>
            {recurringsData
              .filter((recurring) => recurring.isExpense)
              .map((recurring) => (
                <RecurringListElement key={recurring.id} recurring={recurring} />
              ))}
          </ul>
        </div>

        {/* Recurring incomes */}
        <div className="flex w-full flex-col gap-4">
          <h3 className="text-2xl">Recurring incomes:</h3>
          <ul className="flex w-full flex-col gap-2 rounded bg-lime-600 bg-opacity-10 p-1">
            <li className="flex w-full rounded bg-slate-700 py-2 pr-10 font-extrabold">
              <span className="w-1/4 px-2">Name</span>
              <span className="w-1/4 px-2">Category</span>
              <span className="w-1/4 px-2 text-right">Value</span>
              <span className="w-1/4 px-2 text-right">Day of month</span>
            </li>
            {recurringsData
              .filter((recurring) => !recurring.isExpense)
              .map((recurring) => (
                <RecurringListElement key={recurring.id} recurring={recurring} />
              ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default RecurringsPage;

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
