import React, { type PropsWithChildren } from "react";
import Head from "next/head";
import Navbar from "./Navbar";

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Head>
        <title>budgetor</title>
        <meta name="description" content="budgetor - An app to keep track of your expences" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex grow flex-col items-center bg-slate-900 p-8 text-slate-200">{children}</div>
      </main>
    </>
  );
};

export default Layout;
