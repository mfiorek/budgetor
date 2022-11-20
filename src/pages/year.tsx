import React from "react";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Layout from "../components/Layout";

const YearPage: NextPage = () => {
  useSession({ required: true });
  return <Layout>Coming soon: Year view!</Layout>;
};

export default YearPage;
