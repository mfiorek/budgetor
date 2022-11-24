import React, { useState } from "react";
import { type NextPage, type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { trpc } from "../utils/trpc";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import UpsertCategoryModal from "../components/UpsertCategoryModal";
import CategoryListElement from "../components/CategoryListElement";

const SettingsPage: NextPage = () => {
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const { data: categoriesData, isLoading: isCategoriesLoading } = trpc.category.getAll.useQuery();

  if (isCategoriesLoading || !categoriesData) {
    return (
      <Layout>
        <Loader text="Loading settings..." />
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl">Categories:</h3>
          <button className="rounded bg-slate-600 p-1 hover:bg-slate-500" onClick={() => setIsAddCategoryModalOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {categoriesData
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .map((category) => (
              <CategoryListElement key={category.id} category={category} />
            ))}
        </div>
      </div>
      {isAddCategoryModalOpen && <UpsertCategoryModal isOpen={isAddCategoryModalOpen} setIsOpen={setIsAddCategoryModalOpen} />}
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
