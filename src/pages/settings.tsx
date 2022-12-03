import React from "react";
import { type NextPage, type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { trpc } from "../utils/trpc";
import Layout from "../components/Layout";
import Loader from "../components/Loader";

const SettingsPage: NextPage = () => {
  const { data: check } = trpc.recurringTransaction.check.useQuery(undefined, { staleTime: 1000 * 60 * 60 * 24 });
  const { data: transactionsData, isLoading: isTransactionsLoading } = trpc.transaction.getAll.useQuery(undefined, { enabled: check !== undefined, staleTime: 1000 * 60 * 5 });
  const { data: categoriesData, isLoading: isCategoriesLoading } = trpc.category.getAll.useQuery(undefined, { staleTime: 1000 * 60 * 5 });
  const { data: recurringsData, isLoading: isRecurringsLoading } = trpc.recurringTransaction.getAll.useQuery(undefined, { staleTime: 1000 * 60 * 5 });

  if (isTransactionsLoading || isCategoriesLoading || isRecurringsLoading || !transactionsData || !categoriesData || !recurringsData) {
    return (
      <Layout>
        <Loader text="Loading..." />
      </Layout>
    );
  }

  const transactionsCsvContent =
    "data:text/csv;charset=utf-8," +
    "id,name,date,isExpense,value,category_id,category_name,createdAt,updatedAt\n" +
    transactionsData.map((t) => `${t.id},${t.name},${t.date},${t.isExpense},${t.value},${t.categoryId},${t.category?.name},${t.createdAt},${t.updatedAt}`).join("\n");
  const transactionsEncodedUri = encodeURI(transactionsCsvContent);

  const categoriesCsvContent =
    "data:text/csv;charset=utf-8," +
    "id,icon,name,isExpense,color,createdAt,updatedAt\n" +
    categoriesData.map((c) => `${c.id},${c.icon},${c.name},${c.isExpense},${c.color.slice(1)},${c.createdAt},${c.updatedAt}`).join("\n");
  const categoriesEncodedUri = encodeURI(categoriesCsvContent);

  const recurringsCsvContent =
    "data:text/csv;charset=utf-8," +
    "id,name,day_of_month,isExpense,value,category_id,category_name,createdAt,updatedAt\n" +
    recurringsData.map((r) => `${r.id},${r.name},${r.dayOfMonth},${r.isExpense},${r.value},${r.categoryId},${r.category?.name},${r.createdAt},${r.updatedAt}`).join("\n");
  const recurringsEncodedUri = encodeURI(recurringsCsvContent);

  return (
    <Layout>
      <div className="flex w-full flex-col items-start gap-2">
        <h3 className="text-2xl">Export data:</h3>
        <a href={transactionsEncodedUri} download="budgetor_transactions_data.csv" className="flex gap-2 rounded bg-sky-700 px-3 py-2 hover:bg-sky-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
            />
          </svg>
          <span>Download CSV with Transactions</span>
        </a>
        <a href={categoriesEncodedUri} download="budgetor_categories_data.csv" className="flex gap-2 rounded bg-sky-700 px-3 py-2 hover:bg-sky-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
            />
          </svg>
          <span>Download CSV with Categories</span>
        </a>
        <a href={recurringsEncodedUri} download="budgetor_recurrings_data.csv" className="flex gap-2 rounded bg-sky-700 px-3 py-2 hover:bg-sky-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
            />
          </svg>
          <span>Download CSV with Recurring Transactions</span>
        </a>
      </div>
    </Layout>
  );
};

export default SettingsPage;

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
