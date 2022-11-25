import React from "react";
import { type Category, type Transaction } from "@prisma/client";
import { trpc } from "../utils/trpc";
import { Menu } from "@headlessui/react";
import Link from "next/link";

interface TransactionListElementProps {
  transaction: Transaction & { category: Category | null };
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
        <span className="w-1/4 px-2">
          {transaction.category ? (
            <>
              {transaction.category.icon} {transaction.category.name}
            </>
          ) : (
            <>-</>
          )}
        </span>
        <span className={`w-1/4 px-2 text-right ${transaction.isExpense ? "text-red-400" : "text-lime-500"}`}>
          {transaction.isExpense && "-"}
          {transaction.value.toFixed(2)} zł
        </span>
        <span className="w-1/4 px-2 text-right">{transaction.date.toLocaleDateString()}</span>
      </div>
      <Menu as="div" className="relative h-6">
        <Menu.Button>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        </Menu.Button>
        <Menu.Items className="absolute right-0 z-10 min-w-max rounded-lg bg-slate-700 p-1">
          <Menu.Item>
            <Link
              href={{ pathname: "/transaction", query: { id: transaction.id } }}
              className="mb-1 flex w-full min-w-[7rem] items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-slate-500 hover:bg-opacity-25"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                />
              </svg>
              <span>Edit</span>
            </Link>
          </Menu.Item>
          <Menu.Item
            as="div"
            className="group flex w-full min-w-[7rem] items-center gap-2 rounded px-2 py-1.5 hover:bg-red-500 hover:bg-opacity-50"
            onClick={() => mutate({ id: transaction.id })}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className="h-6 w-6 stroke-red-500 group-hover:stroke-slate-200">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
            <span>Delete</span>
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </li>
  );
};

export default TransactionListElement;
