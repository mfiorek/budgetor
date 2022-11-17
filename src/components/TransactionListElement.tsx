import React from "react";
import { type Transaction } from "@prisma/client";
import { trpc } from "../utils/trpc";

interface TransactionListElementProps {
  transaction: Transaction;
}

const TransactionListElement: React.FC<TransactionListElementProps> = ({ transaction }) => {
  const utils = trpc.useContext();
  const { mutate } = trpc.transaction.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.transaction.getAll.cancel();
      const previousTransacions = utils.transaction.getAll.getData();
      if (previousTransacions) {
        utils.transaction.getAll.setData(previousTransacions.filter((t) => t.id !== id));
      }
      return previousTransacions;
    },
    onError: (error, variables, context) => {
      utils.transaction.getAll.setData(context);
    },
    onSuccess: () => utils.transaction.getAll.invalidate(),
  });

  return (
    <li className="flex w-full items-center rounded bg-slate-800 even:bg-opacity-25">
      <div className={`flex w-full py-2`}>
        <span className="w-1/4 px-2">{transaction.name}</span>
        <span className="w-1/4 px-2">{transaction.category}</span>
        <span className={`w-1/4 px-2 text-right ${transaction.isExpense ? "text-red-400" : "text-lime-500"}`}>
          {transaction.isExpense && "-"}
          {transaction.value.toFixed(2)} zł
        </span>
        <span className="w-1/4 px-2 text-right">{transaction.date.toLocaleDateString()}</span>
      </div>
      <button className="m-1 flex aspect-square h-6 w-6 items-center justify-center rounded bg-red-500 p-1" onClick={() => mutate({ id: transaction.id })}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  );
};

export default TransactionListElement;
