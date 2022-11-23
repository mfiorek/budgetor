import React from "react";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Layout from "../components/Layout";

const SettingsPage: NextPage = () => {
  useSession({ required: true });
  return <Layout>Coming soon: Settings!</Layout>;
};

export default SettingsPage;
