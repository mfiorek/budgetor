import React, { type PropsWithChildren } from "react";
import BudgetorHead from "./BudgetorHead";
import Navbar from "./Navbar";

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <BudgetorHead />
      <main className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex grow flex-col items-center bg-slate-900 p-8 text-slate-200">{children}</div>
      </main>
    </>
  );
};

export default Layout;
