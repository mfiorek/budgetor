import { type NextPage } from "next";
import { trpc } from "../utils/trpc";
import Layout from "../components/Layout";

const Home: NextPage = () => {
  const { data, isLoading } = trpc.transaction.getAll.useQuery();

  if (isLoading || !data) {
    return <Layout>Loading...</Layout>;
  }
  return (
    <Layout>
      <h1 className="text-5xl font-extrabold text-slate-400">budgetor</h1>
      <h1 className="text-xl font-extrabold text-slate-400">
        Total = {data.map(t => t.value).reduce((partialSum, a) => partialSum + a, 0)}
      </h1>
      <p>
        {data.map((transaction) => (
          <div key={transaction.id} className="flex gap-4">
            <span>{transaction.name}</span>
            <span>{transaction.category}</span>
            <span>{transaction.value}</span>
          </div>
        ))}
      </p>
    </Layout>
  );
};

export default Home;
