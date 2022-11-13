import React, { type PropsWithChildren } from "react";
import Head from "next/head";

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Head>
        <title>budgetor</title>
        <meta
          name="description"
          content="budgetor - An app to keep track of your expences"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-slate-200">
        {children}
      </main>
    </>
  );
};

export default Layout;
