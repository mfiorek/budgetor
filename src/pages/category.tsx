import React from "react";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "../utils/trpc";
import { useTrpcSession } from "../hooks/useTrpcSession";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import CategoryForm from "../components/CategoryForm";

const AddCategoryPage = () => {
  return (
    <Layout>
      <CategoryForm />
    </Layout>
  );
};

interface EditCategoryPageProps {
  categoryId: string;
}
const EditCategoryPage: React.FC<EditCategoryPageProps> = ({ categoryId }) => {
  const router = useRouter();
  const { data: categoriesData, isLoading: isCategoriesLoading } = trpc.category.getAll.useQuery(undefined, { staleTime: 1000 * 60 * 5 });

  if (isCategoriesLoading || !categoriesData) {
    return (
      <Layout>
        <Loader text="Loading..." />
      </Layout>
    );
  }
  const category = categoriesData.find((category) => category.id === categoryId);
  if (!category) {
    router.push("/404");
    return null;
  }

  return (
    <Layout>
      <CategoryForm editingCategory={category} />
    </Layout>
  );
};

const CategoryPage: NextPage = () => {
  const { data, isLoading } = useTrpcSession({ authRequired: true });
  const router = useRouter();
  const { id } = router.query;

  if (typeof id === "object") {
    router.push("/404");
    return null;
  }

  if (!data || isLoading) {
    return (
      <Layout>
        <Loader text="Loading..." />
      </Layout>
    );
  }
  if (!id) {
    return <AddCategoryPage />;
  }
  return <EditCategoryPage categoryId={id} />;
};

export default CategoryPage;
