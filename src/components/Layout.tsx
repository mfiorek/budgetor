import React, { type PropsWithChildren } from "react";
import BudgetorHead from "./BudgetorHead";
import Navbar from "./Navbar";

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <BudgetorHead />
      <main className="flex min-h-screen flex-col">
        <Navbar />
        <div className="grow bg-slate-800 text-slate-200">
          <div className="mx-auto flex w-full flex-col items-center px-2 py-4 lg:max-w-5xl">{children}</div>
        </div>
      </main>
    </>
  );
};

export default Layout;
