import { useState } from "react";
import { type NextPage } from "next";
import { trpc } from "../utils/trpc";
import Layout from "../components/Layout";
import AddTransactionModal from "../components/AddTransactionModal";

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
        Total ={" "}
        {data.map((t) => t.value).reduce((partialSum, a) => partialSum + a, 0)}
      </h1>
      <div>
        {data.map((transaction) => (
          <div key={transaction.id} className="flex gap-4">
            <span>{transaction.name}</span>
            <span>{transaction.category}</span>
            <span>{transaction.value}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => setIsAddTransacionModalOpen(true)}
        className="mt-8 rounded bg-lime-700 px-3 py-1 font-semibold hover:bg-lime-600"
      >
        Add
      </button>
      <AddTransactionModal
        isOpen={isAddTransacionModalOpen}
        setIsOpen={setIsAddTransacionModalOpen}
      />
    </Layout>
  );
};

export default Home;
