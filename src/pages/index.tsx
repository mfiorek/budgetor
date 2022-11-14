import { useState } from "react";
import { type NextPage } from "next";
import { trpc } from "../utils/trpc";
import Layout from "../components/Layout";
import AddTransactionModal from "../components/AddTransactionModal";
import TransactionListElement from "../components/TransactionListElement";

const Home: NextPage = () => {
  const [isAddTransacionModalOpen, setIsAddTransacionModalOpen] =
    useState(false);
  const { data, isLoading } = trpc.transaction.getAll.useQuery();

  if (isLoading || !data) {
    return <Layout>Loading...</Layout>;
  }
  return (
    <Layout>
      <h1 className="text-5xl font-extrabold text-slate-400">budgetor</h1>
      <h1 className="text-xl font-extrabold text-slate-400">
        Total:{" "}
        {data.map((t) => t.value).reduce((partialSum, a) => partialSum + a, 0)}
      </h1>
      <div className="flex w-full justify-end">
        <button
          onClick={() => setIsAddTransacionModalOpen(true)}
          className="my-4 rounded bg-lime-700 px-3 py-1 font-semibold hover:bg-lime-600"
        >
          Add
        </button>
      </div>
      <ul className="flex w-full flex-col gap-2 rounded-md bg-slate-700 bg-opacity-20 p-1">
        <li className="flex w-full rounded bg-slate-700 py-2 font-extrabold">
          <span className="w-1/4 px-2">Name</span>
          <span className="w-1/4 px-2">Category</span>
          <span className="w-1/4 px-2 text-right">Value</span>
          <span className="w-1/4 px-2 text-right">Date</span>
        </li>
        {data.map((transaction) => (
          <TransactionListElement
            key={transaction.id}
            transaction={transaction}
          />
        ))}
      </ul>
      <AddTransactionModal
        isOpen={isAddTransacionModalOpen}
        setIsOpen={setIsAddTransacionModalOpen}
      />
    </Layout>
  );
};

export default Home;
