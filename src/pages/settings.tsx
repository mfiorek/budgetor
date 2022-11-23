import React, { useState } from "react";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import AddCategoryModal from "../components/AddCategoryModal";

const SettingsPage: NextPage = () => {
  useSession({ required: true });
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
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl">Categories:</h3>
          <button className="rounded bg-slate-600 p-1 hover:bg-slate-500" onClick={() => setIsAddCategoryModalOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {categoriesData.map((category) => (
            <label key={category.id} className={`flex w-24 select-none flex-col items-center justify-center rounded p-2`} style={{ backgroundColor: `${category.color}` }}>
              <span className="text-2xl">{category.iconSrc}</span>
              <span className="text-center" style={{ textShadow: "0px 0px 2px black" }}>
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>
      {isAddCategoryModalOpen && <AddCategoryModal isOpen={isAddCategoryModalOpen} setIsOpen={setIsAddCategoryModalOpen} />}
    </Layout>
  );
};

export default SettingsPage;
