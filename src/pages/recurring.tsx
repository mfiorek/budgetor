import React from "react";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Layout from "../components/Layout";

const RecurringPage: NextPage = () => {
  useSession({ required: true });
  return <Layout>Coming soon: Recurring transactions</Layout>;
};

export default RecurringPage;
