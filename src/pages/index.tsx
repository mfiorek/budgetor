import { useState } from "react";
import { type NextPage } from "next";
import { trpc } from "../utils/trpc";
import Layout from "../components/Layout";
import AddTransactionModal from "../components/AddTransactionModal";
import Doughnut from "../components/Doughnut";
import TransactionListElement from "../components/TransactionListElement";

const Home: NextPage = () => {
  const [isAddTransacionModalOpen, setIsAddTransacionModalOpen] = useState(false);
  const { data, isLoading } = trpc.transaction.getAll.useQuery();

  if (isLoading || !data) {
    return <Layout>Loading...</Layout>;
  }
  return (
    <Layout>
      <input type="month" />
      <Doughnut
        income={data
          .filter((t) => !t.isExpense)
          .map((t) => t.value)
          .reduce((partialSum, a) => partialSum + a, 0)}
        expense={data
          .filter((t) => t.isExpense)
          .map((t) => t.value)
          .reduce((partialSum, a) => partialSum + a, 0)}
      />
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
        {data.map((transaction) => (
          <TransactionListElement key={transaction.id} transaction={transaction} />
        ))}
      </ul>
      {isAddTransacionModalOpen && <AddTransactionModal isOpen={isAddTransacionModalOpen} setIsOpen={setIsAddTransacionModalOpen} />}
    </Layout>
  );
};

export default Home;
