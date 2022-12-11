import React from "react";
import { type NextPage } from "next";
import { trpc } from "../utils/trpc";
import { useTrpcSession } from "../hooks/useTrpcSession";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import TransactionForm from "../components/TransactionForm";
import { useRouter } from "next/router";

const AddTransactionPage = () => {
  const { data: categoriesData, isLoading: isCategoriesLoading } = trpc.category.getAll.useQuery(undefined, { staleTime: 1000 * 60 * 5 });

  if (isCategoriesLoading || !categoriesData) {
    return (
      <Layout>
        <Loader text="Loading..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <TransactionForm categoriesData={categoriesData} />
    </Layout>
  );
};

interface EditTransactionPageProps {
  transactionId: string;
}
const EditTransactionPage: React.FC<EditTransactionPageProps> = ({ transactionId }) => {
  const router = useRouter();
  const { data: transactionsData, isLoading: isTransactionsLoading } = trpc.transaction.getAll.useQuery(undefined, { staleTime: 1000 * 60 * 5 });
  const { data: categoriesData, isLoading: isCategoriesLoading } = trpc.category.getAll.useQuery(undefined, { staleTime: 1000 * 60 * 5 });

  if (isTransactionsLoading || isCategoriesLoading || !transactionsData || !categoriesData) {
    return (
      <Layout>
        <Loader text="Loading..." />
      </Layout>
    );
  }
  const transaction = transactionsData.find((transaction) => transaction.id === transactionId);
  if (!transaction) {
    router.push("/404");
    return null;
  }

  return (
    <Layout>
      <TransactionForm categoriesData={categoriesData} editingTransaction={transaction} />
    </Layout>
  );
};

const TransactionPage: NextPage = () => {
  useTrpcSession({ authRequired: true });
  const router = useRouter();
  const { id } = router.query;

  if (typeof id === "object") {
    router.push("/404");
    return null;
  }
  if (!id) {
    return <AddTransactionPage />;
  }
  return <EditTransactionPage transactionId={id} />;
};

export default TransactionPage;
