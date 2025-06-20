import React from "react";
import { type RecurringTransaction, type Category } from "@prisma/client";
import { trpc } from "../utils/trpc";
import { createColumnHelper, useReactTable, flexRender, getCoreRowModel, type RowData } from "@tanstack/react-table";
import { Menu } from "@headlessui/react";
import { formatNumber } from "../utils/currencyFormat";
import Link from "next/link";

declare module "@tanstack/table-core" {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  interface ColumnMeta<TData extends RowData, TValue> {
    isDisplayColumn?: boolean;
    showOnMobile?: boolean;
  }
}

interface RowMenuProps {
  recurring: RecurringTransaction & { category: Category | null };
}
const RowMenu: React.FC<RowMenuProps> = ({ recurring }) => {
  const utils = trpc.useContext();
  const { mutate } = trpc.recurringTransaction.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.recurringTransaction.getAll.cancel();
      const previousRecurrings = utils.recurringTransaction.getAll.getData();
      if (previousRecurrings) {
        utils.recurringTransaction.getAll.setData(
          undefined,
          previousRecurrings.filter((t) => t.id !== id)
        );
      }
      return previousRecurrings;
    },
    onError: (error, variables, context) => {
      utils.recurringTransaction.getAll.setData(undefined, context);
    },
    onSuccess: () => utils.recurringTransaction.getAll.invalidate(),
  });

  return (
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
      <Menu.Items className="arrowDown absolute -right-3 bottom-8 z-10 min-w-max rounded-lg border border-slate-600 bg-slate-800 p-1 shadow-lg">
        <Menu.Item>
          {({ active }) => (
            <Link
              href={{ pathname: "/recurring", query: { id: recurring.id } }}
              className={`mb-1 flex w-full min-w-[7rem] items-center gap-2 rounded px-2 py-1.5 text-left ${active && "bg-slate-600 bg-opacity-25"}`}
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
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <div
              className={`hover:bg-opacity-50" group flex w-full min-w-[7rem] cursor-pointer items-center gap-2 rounded px-2 py-1.5 ${active && "bg-red-500 bg-opacity-50"}`}
              onClick={() => mutate({ id: recurring.id })}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className={`h-6 w-6 stroke-red-500 ${active && "stroke-slate-200"}`}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
              <span>Delete</span>
            </div>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
};

interface RecurringsTableProps {
  data: (RecurringTransaction & { category: Category | null })[];
}
const RecurringsTable: React.FC<RecurringsTableProps> = ({ data }) => {
  const getOrdinalSuffix = (day: number) => {
    const ending = day % 10;
    if (ending === 1 && day != 11) {
      return "st";
    }
    if (ending === 2 && day != 12) {
      return "nd";
    }
    if (ending === 3 && day != 13) {
      return "rd";
    }
    return "th";
  };

  const columnHelper = createColumnHelper<RecurringTransaction & { category: Category | null }>();
  const columns = [
    columnHelper.accessor("name", {
      header: () => <span>Name</span>,
      cell: (info) => (
        <div className="text-left">
          <p>{info.getValue()}</p>
          <p className="text-xs sm:hidden">{info.row.original.category ? `${info.row.original.category.icon} ${info.row.original.category.name}` : "-"}</p>
        </div>
      ),
      meta: { showOnMobile: true },
    }),
    columnHelper.accessor((row) => (row.category ? `${row.category.icon} ${row.category.name}` : "-"), {
      id: "category_name",
      header: () => <span>Category</span>,
      cell: (info) => <span className="whitespace-nowrap">{info.row.original.category ? `${info.row.original.category.icon} ${info.row.original.category.name}` : "-"}</span>,
      meta: { showOnMobile: false },
    }),
    columnHelper.accessor((row) => (row.isExpense ? -1 : 1) * row.value * row.fxRate, {
      id: "value",
      header: () => <span className="w-full text-right">Value</span>,
      cell: (info) => (
        <div className="w-full">
          <span className={`block text-right ${info.getValue() < 0 ? "text-red-400" : "text-lime-500"}`}>{formatNumber(info.getValue())} zł</span>
          {info.row.original.isFX && (
            <span className={`block text-right text-sm italic ${info.getValue() < 0 ? "text-red-400" : "text-lime-500"}`}>
              {formatNumber((info.row.original.isExpense ? -1 : 1) * info.row.original.value)} {info.row.original.fxSymbol}
            </span>
          )}
          <p className="text-right text-xs sm:hidden">
            <span>Every {info.row.original.dayOfMonth}</span>
            <sup>{getOrdinalSuffix(info.row.original.dayOfMonth)}</sup>
          </p>
        </div>
      ),
      meta: { showOnMobile: true },
    }),
    columnHelper.accessor("dayOfMonth", {
      header: () => <span className="w-full text-right">Day of month</span>,
      cell: (info) => (
        <span className="block text-right">
          <span>{info.getValue()}</span>
          <sup>{getOrdinalSuffix(info.getValue())}</sup>
        </span>
      ),
      meta: { showOnMobile: false },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="w-6"></span>,
      cell: (props) => (
        <span className="w-6">
          <RowMenu recurring={props.row.original} />
        </span>
      ),
      meta: { isDisplayColumn: true, showOnMobile: true },
    }),
  ];
  const table = useReactTable({
    data: data.sort((a, b) => a.dayOfMonth - b.dayOfMonth),
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="flex w-full flex-col gap-2 rounded-md bg-slate-700 bg-opacity-20 p-1">
      <thead className="flex w-full rounded bg-slate-700">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="flex w-full gap-2 p-2">
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className={`${header.column.columnDef.meta?.isDisplayColumn ? "w-6" : "flex flex-1"} ${!header.column.columnDef.meta?.showOnMobile && "hidden sm:block"}`}
              >
                <div className="flex w-full">{flexRender(header.column.columnDef.header, header.getContext())}</div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="flex w-full flex-col gap-2">
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="flex w-full items-center gap-2 rounded bg-slate-800 p-2 odd:bg-opacity-25">
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className={`${cell.column.columnDef.meta?.isDisplayColumn ? "w-6" : "flex flex-1"} ${!cell.column.columnDef.meta?.showOnMobile && "hidden sm:block"}`}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RecurringsTable;
