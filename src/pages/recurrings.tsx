import React from "react";
import { type NextPage } from "next";
import { trpc } from "../utils/trpc";
import { useTrpcSession } from "../hooks/useTrpcSession";
import Link from "next/link";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import RecurringsTable from "../components/RecurringsTable";

const RecurringsPage: NextPage = () => {
  useTrpcSession({ authRequired: true });
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
          <RecurringsTable data={recurringsData.filter((recurring) => recurring.isExpense)} />
        </div>

        {/* Recurring incomes */}
        <div className="flex w-full flex-col gap-4">
          <h3 className="text-2xl">Recurring incomes:</h3>
          <RecurringsTable data={recurringsData.filter((recurring) => !recurring.isExpense)} />
        </div>
      </div>
    </Layout>
  );
};

export default RecurringsPage;
