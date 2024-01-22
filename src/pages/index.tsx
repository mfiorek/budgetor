import { useState } from "react";
import { type NextPage } from "next";
import { useTrpcSession } from "../hooks/useTrpcSession";
import dateStringHelper from "../utils/dateStringsHelper";
import Layout from "../components/Layout";
import MonthSelector from "../components/MonthSelector";
import TotalSummary from "../components/TotalSummary";
import ChartjsDoughnut from "../components/ChartjsDoughnut";
import Link from "next/link";
import TransactionsTable from "../components/TransactionsTable";
import TableControls from "../components/TableControls";
import { trpc } from "../utils/trpc";
import Loader from "../components/Loader";

const Home: NextPage = () => {
  const monthLater = new Date();
  monthLater.setMonth(monthLater.getMonth() + 1);
  const [periodStart, setPeriodStart] = useState<Date>(new Date(`${new Date().getFullYear()}-${dateStringHelper.getMonthString(new Date())}`));
  const [periodEnd, setPeriodEnd] = useState<Date>(new Date(`${monthLater.getFullYear()}-${dateStringHelper.getMonthString(monthLater)}`));

  useTrpcSession({ authRequired: true });
  const { data, isLoading } = trpc.transaction.getSums.useQuery({ periodStart, periodEnd });

  if (isLoading || !data) {
    return <Loader text="Loading transactions..." />;
  }
  const {
    income: {
      _sum: { value: incomeSum },
    },
    expense: {
      _sum: { value: expenseSum },
    },
  } = data;

  // const income = transactionsData
  //   .filter((t) => t.date.getTime() >= periodStart.getTime() && t.date.getTime() < periodEnd.getTime())
  //   .filter((t) => !t.isExpense)
  //   .map((t) => t.value * t.fxRate)
  //   .reduce((partialSum, a) => partialSum + a, 0);
  // const expense = transactionsData
  //   .filter((t) => t.date.getTime() >= periodStart.getTime() && t.date.getTime() < periodEnd.getTime())
  //   .filter((t) => t.isExpense)
  //   .map((t) => t.value * t.fxRate)
  //   .reduce((partialSum, a) => partialSum + a, 0);

  return (
    <Layout>
      <div className="flex w-full flex-col gap-4">
        <MonthSelector setPeriodStart={setPeriodStart} setPeriodEnd={setPeriodEnd} />
        <TotalSummary income={incomeSum || 0} expense={expenseSum || 0} />
        <ChartjsDoughnut periodStart={periodStart} periodEnd={periodEnd} income={incomeSum || 0} expense={expenseSum || 0} />
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
        <TransactionsTable periodStart={periodStart} periodEnd={periodEnd} />
      </div>
    </Layout>
  );
};

export default Home;
