import React from "react";
import Head from "next/head";

const BudgetorHead = () => {
  return (
    <Head>
      <title>budgetor</title>
      <meta name="description" content="budgetor - An app to keep track of your expences" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#334155" />
      <meta name="apple-mobile-web-app-title" content="budgetor" />
      <meta name="application-name" content="budgetor" />
      <meta name="msapplication-TileColor" content="#334155" />
      <meta name="theme-color" content="#334155" />
    </Head>
  );
};

export default BudgetorHead;
