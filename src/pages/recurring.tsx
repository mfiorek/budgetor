import React from "react";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "../utils/trpc";
import { useTrpcSession } from "../hooks/useTrpcSession";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import RecurringForm from "../components/RecurringForm";

const AddRecurringPage = () => {
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
      <RecurringForm categoriesData={categoriesData} />
    </Layout>
  );
};

interface EditRecurringPageProps {
  recurringId: string;
}
const EditRecurringPage: React.FC<EditRecurringPageProps> = ({ recurringId }) => {
  const router = useRouter();
  const { data: recurringsData, isLoading: isRecurringsLoading } = trpc.recurringTransaction.getAll.useQuery(undefined, { staleTime: 1000 * 60 * 5 });
  const { data: categoriesData, isLoading: isCategoriesLoading } = trpc.category.getAll.useQuery(undefined, { staleTime: 1000 * 60 * 5 });

  if (isRecurringsLoading || isCategoriesLoading || !recurringsData || !categoriesData) {
    return (
      <Layout>
        <Loader text="Loading..." />
      </Layout>
    );
  }
  const recurring = recurringsData.find((recurring) => recurring.id === recurringId);
  if (!recurring) {
    router.push("/404");
    return null;
  }

  return (
    <Layout>
      <RecurringForm categoriesData={categoriesData} editingRecurring={recurring} />
    </Layout>
  );
};

const RecurringPage: NextPage = () => {
  useTrpcSession({ authRequired: true });
  const router = useRouter();
  const { id } = router.query;

  if (typeof id === "object") {
    router.push("/404");
    return null;
  }
  if (!id) {
    return <AddRecurringPage />;
  }
  return <EditRecurringPage recurringId={id} />;
};

export default RecurringPage;
