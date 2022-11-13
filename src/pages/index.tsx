import { type NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
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
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900">
        <h1 className="text-5xl font-extrabold text-slate-400">budgetor</h1>
      </main>
    </>
  );
};

export default Home;
