import React from "react";
import { formatNumber } from "../utils/currencyFormat";

interface TotalSummaryProps {
  income: number;
  expense: number;
}

const TotalSummary: React.FC<TotalSummaryProps> = ({ income, expense }) => {
  const total = income - expense;

  return (
    <div className="flex flex-col items-center gap-2">
      <h1
        className={`text-5xl font-extrabold
          ${total === 0 && "text-slate-400"}
          ${total < 0 && "text-red-400"}
          ${total > 0 && "text-lime-500"}`}
      >
        {formatNumber(total)} zł
      </h1>
      <div className="flex w-full justify-between gap-8">
        <h3 className="text-lime-400">{formatNumber(income)} zł</h3>
        <h3 className="text-right text-red-400">-{formatNumber(expense)} zł</h3>
      </div>
    </div>
  );
};

export default TotalSummary;
