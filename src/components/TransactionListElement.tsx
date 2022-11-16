import React from "react";
import { type Transaction } from "@prisma/client";

interface TransactionListElementProps {
  transaction: Transaction;
}

const TransactionListElement: React.FC<TransactionListElementProps> = ({
  transaction,
}) => {
  return (
    <li className="flex w-full bg-slate-800 even:bg-opacity-25">
      <div className={`flex w-full rounded py-2`}>
        <span className="w-1/4 px-2">{transaction.name}</span>
        <span className="w-1/4 px-2">{transaction.category}</span>
        <span
          className={`w-1/4 px-2 text-right ${
            transaction.isExpense ? "text-red-400" : "text-lime-500"
          }`}
        >
          {transaction.isExpense && "-"}
          {transaction.value.toFixed(2)} zł
        </span>
        <span className="w-1/4 px-2 text-right">
          {transaction.date.toLocaleDateString()}
        </span>
      </div>
    </li>
  );
};

export default TransactionListElement;
