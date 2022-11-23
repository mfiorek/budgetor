import { useState } from "react";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import Layout from "../components/Layout";
import AddTransactionModal from "../components/AddTransactionModal";
import MonthSelector from "../components/MonthSelector";
import Doughnut from "../components/Doughnut";
import TransactionListElement from "../components/TransactionListElement";

const Home: NextPage = () => {
  useSession({ required: true });
  const [isAddTransacionModalOpen, setIsAddTransacionModalOpen] = useState(false);
  const [periodStart, setPeriodStart] = useState<Date>(new Date(`${new Date().getFullYear()}-${new Date().getMonth() + 1}`));
  const [periodEnd, setPeriodEnd] = useState<Date>(new Date(`${new Date().getFullYear()}-${new Date().getMonth() + 2}`));

  const { data: transactionsData, isLoading: isTransactionsLoading } = trpc.transaction.getAll.useQuery();
  const { data: categoriesData, isLoading: isCategoriesLoading } = trpc.category.getAll.useQuery();

  if (isTransactionsLoading || isCategoriesLoading || !transactionsData || !categoriesData) {
    return <Layout>Loading...</Layout>;
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
        <button onClick={() => setIsAddTransacionModalOpen(true)} className="my-4 rounded bg-lime-700 px-3 py-1 font-semibold hover:bg-lime-600">
          Add
        </button>
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
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .map((transaction) => (
            <TransactionListElement key={transaction.id} transaction={transaction} />
          ))}
      </ul>
      {isAddTransacionModalOpen && <AddTransactionModal isOpen={isAddTransacionModalOpen} setIsOpen={setIsAddTransacionModalOpen} categoriesData={categoriesData} />}
    </Layout>
  );
};

export default Home;
