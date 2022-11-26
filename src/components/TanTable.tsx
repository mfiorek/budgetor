import React, { useState } from "react";
import { type Category, type Transaction } from "@prisma/client";
import { trpc } from "../utils/trpc";
import {
  createColumnHelper,
  useReactTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import { Menu } from "@headlessui/react";
import Link from "next/link";
import { useAtomValue } from "jotai";
import { groupColumnsAtom } from "../state/atoms";

declare module "@tanstack/table-core" {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  interface ColumnMeta<TData extends RowData, TValue> {
    isDisplayColumn: boolean;
  }
}

interface RowMenuProps {
  transaction: Transaction & { category: Category | null };
}
const RowMenu: React.FC<RowMenuProps> = ({ transaction }) => {
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
  );
};

interface TanTableProps {
  data: (Transaction & { category: Category | null })[];
}
const TanTable: React.FC<TanTableProps> = ({ data }) => {
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
  const groupingAtom = useAtomValue(groupColumnsAtom);

  const columnHelper = createColumnHelper<Transaction & { category: Category | null }>();
  const columns = [
    columnHelper.accessor("name", {
      header: () => <span>Name</span>,
      cell: (info) => <span>{info.getValue()}</span>,
    }),
    columnHelper.accessor("category.name", {
      header: () => <span>Category</span>,
      cell: (info) => (
        <span>
          {info.row.original.category?.icon} {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor((row) => (row.isExpense ? -1 : 1) * row.value, {
      id: "value",
      header: (props) => <span className={`${props.column.getIsGrouped() || "w-full text-right"}`}>Value</span>,
      cell: (info) => <span className={`block text-right ${info.getValue() < 0 ? "text-red-400" : "text-lime-500"}`}>{info.getValue().toFixed(2)} zł</span>,
      aggregatedCell: (info) => <span className={`block text-right ${info.getValue() < 0 ? "text-red-400" : "text-lime-500"}`}>{info.getValue().toFixed(2)} zł</span>,
    }),
    columnHelper.accessor("date", {
      header: (props) => <span className={`${props.column.getIsGrouped() || "w-full text-right"}`}>Date</span>,
      cell: (info) => <span className="block text-right">{info.getValue().toLocaleDateString()}</span>,
      aggregatedCell: () => null,
      sortingFn: (a, b) => a.original.date.getTime() - b.original.date.getTime() || a.original.createdAt.getTime() - b.original.createdAt.getTime(),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="w-6"></span>,
      cell: (props) => (
        <span className="w-6">
          <RowMenu transaction={props.row.original} />
        </span>
      ),
      enableGrouping: false,
      meta: { isDisplayColumn: true },
    }),
  ];
  const table = useReactTable({
    data: data.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
    columns,
    state: {
      sorting,
      grouping: groupingAtom,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <table className="flex w-full flex-col gap-2 rounded-md bg-slate-700 bg-opacity-20 p-1">
      <thead className="flex w-full rounded bg-slate-700">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="flex w-full gap-2 p-2">
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className={`flex cursor-pointer gap-2 ${header.column.columnDef.meta?.isDisplayColumn ? "w-6" : "w-1/4"}`}
                onClick={header.column.getToggleSortingHandler()}
              >
                <div className="flex w-full gap-2">
                  {header.column.getIsGrouped() && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-7.5A2.25 2.25 0 018.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 00-2.25 2.25v6"
                      />
                    </svg>
                  )}
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {!header.column.columnDef.meta?.isDisplayColumn
                    ? {
                        asc: (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                          </svg>
                        ),
                        desc: (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        ),
                        false: (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                          </svg>
                        ),
                      }[header.column.getIsSorted() as string]
                    : null}
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="flex w-full flex-col gap-2">
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="flex w-full items-center gap-2 rounded bg-slate-800 p-2 odd:bg-opacity-25">
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className={`${cell.column.columnDef.meta?.isDisplayColumn ? "w-6" : "w-1/4"}`}>
                {cell.getIsGrouped() ? (
                  // If it's a grouped cell, add an expander and row count
                  <>
                    <button
                      {...{
                        onClick: row.getToggleExpandedHandler(),
                        style: {
                          cursor: row.getCanExpand() ? "pointer" : "normal",
                        },
                        className: "w-full flex gap-2",
                      }}
                    >
                      {row.getIsExpanded() ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      )}{" "}
                      {flexRender(cell.column.columnDef.cell, cell.getContext())} ({row.subRows.length})
                    </button>
                  </>
                ) : cell.getIsAggregated() ? (
                  // If the cell is aggregated, use the Aggregated
                  flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, cell.getContext())
                ) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
                  // Otherwise, just render the regular cell
                  flexRender(cell.column.columnDef.cell, cell.getContext())
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TanTable;
