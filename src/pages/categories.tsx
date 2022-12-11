import React from "react";
import { type NextPage } from "next";
import { trpc } from "../utils/trpc";
import { useTrpcSession } from "../hooks/useTrpcSession";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import CategoryListElement from "../components/CategoryListElement";
import Link from "next/link";

const CategoriesPage: NextPage = () => {
  useTrpcSession({ authRequired: true });
  const { data: categoriesData, isLoading: isCategoriesLoading } = trpc.category.getAll.useQuery(undefined, { staleTime: 1000 * 60 * 5 });

  if (isCategoriesLoading || !categoriesData) {
    return (
      <Layout>
        <Loader text="Loading settings..." />
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="flex w-full flex-col gap-8">
        <Link href="/category" className="mx-auto flex w-full justify-center gap-2 rounded bg-lime-800 px-3 py-2 font-semibold hover:bg-lime-700 sm:max-w-[10rem]">
          <span>Add new</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
        </Link>

        {/* Expense categories */}
        <div className="flex w-full flex-col gap-4">
          <h3 className="text-2xl">Expense categories:</h3>
          <div className="flex flex-col gap-2">
            {categoriesData
              .filter((category) => category.isExpense)
              .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
              .map((category) => (
                <CategoryListElement key={category.id} category={category} />
              ))}
          </div>
        </div>

        {/* Income categories */}
        <div className="flex w-full flex-col gap-4">
          <h3 className="text-2xl">Income categories:</h3>
          <div className="flex flex-col gap-2">
            {categoriesData
              .filter((category) => !category.isExpense)
              .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
              .map((category) => (
                <CategoryListElement key={category.id} category={category} />
              ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoriesPage;
