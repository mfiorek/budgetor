import React, { useEffect } from "react";
import { Disclosure, Listbox } from "@headlessui/react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useAtom, useSetAtom } from "jotai";
import { groupColumnsAtom, filterAtom, filterByAtom, sortAtom } from "../state/atoms";

// Hardcoded for now...
interface PossibleValuesType {
  columnId: string;
  columnName: string;
}
const possibleValues: PossibleValuesType[] = [
  { columnId: "name", columnName: "Name" },
  { columnId: "category_name", columnName: "Category" },
  { columnId: "value", columnName: "Value" },
  { columnId: "date", columnName: "Date" },
];

const GroupForm = () => {
  const [groupColumnsAtomValue, setGroupColumnsAtomValue] = useAtom(groupColumnsAtom);

  type GroupFormInputs = {
    groupColumnIds: PossibleValuesType[];
  };
  const { control, register, watch } = useForm<GroupFormInputs>({
    defaultValues: { groupColumnIds: groupColumnsAtomValue.map((av) => possibleValues.find((pv) => pv.columnId === av)) },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "groupColumnIds" });
  const currentFormValues = useWatch({ control, name: "groupColumnIds" });

  useEffect(() => {
    setGroupColumnsAtomValue(currentFormValues.map((gcid) => gcid.columnId));
  }, [currentFormValues, setGroupColumnsAtomValue]);

  return (
    <div className="flex w-full flex-col gap-2">
      <span className="text-lg font-bold">Group by:</span>
      {!!fields.length && (
        <div className="flex w-full flex-col gap-1">
          {fields.map((columnIdField, index) => {
            return (
              <div key={columnIdField.id} className="flex items-center gap-2 rounded bg-slate-700 p-1 pl-2">
                <input type="hidden" {...register(`groupColumnIds.${index}.columnId` as const)} />
                <p className="w-full">
                  {index + 1}. {columnIdField.columnName}
                </p>
                <button
                  onClick={() => remove(index)}
                  className="flex h-8 w-8 items-center justify-center rounded bg-red-500 bg-opacity-50 p-2 hover:bg-red-400 hover:bg-opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {watch("groupColumnIds").length < possibleValues.length - 1 && (
        <Listbox onChange={append} as="div" className="relative w-max">
          {({ open }) => (
            <>
              <Listbox.Button className="flex cursor-pointer items-center justify-center gap-2 rounded bg-sky-800 p-2 hover:bg-sky-700">
                <i className="pr-8">Add grouping by...</i>
                {open ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                  </svg>
                )}
              </Listbox.Button>
              <Listbox.Options className="absolute z-10 mt-1 w-full rounded-md bg-slate-700 p-1 shadow-lg">
                {possibleValues
                  .filter((value) => !currentFormValues.some((currentValue) => currentValue.columnId === value.columnId))
                  .map((value) => (
                    <Listbox.Option
                      key={value.columnId}
                      value={value}
                      className={({ active }) => `relative z-10 mb-1 cursor-pointer rounded px-2 py-1.5 text-slate-100 last:mb-0 ${active && "bg-slate-600"}`}
                    >
                      {value.columnName}
                    </Listbox.Option>
                  ))}
              </Listbox.Options>
            </>
          )}
        </Listbox>
      )}
    </div>
  );
};

const FilterForm = () => {
  const [filterAtomValue, setFilterAtomValue] = useAtom(filterAtom);
  const [filterByAtomValue, setFilterByAtomValue] = useAtom(filterByAtom);

  const filterByOptions = ["Name", "Category", "Value", "Date"];

  return (
    <div className="flex w-full flex-col gap-2">
      <span className="text-lg font-bold">Filter by:</span>
      <div className="relative">
        <input className="w-full p-2" value={filterAtomValue} onChange={(e) => setFilterAtomValue(e.target.value)} placeholder="Type keywords..." />
        {!!filterAtomValue.length && (
          <div className="absolute right-0 top-0 flex h-full justify-end p-1">
            <button
              onClick={() => setFilterAtomValue("")}
              className="flex h-8 w-8 items-center justify-center rounded bg-red-500 bg-opacity-50 p-2 hover:bg-red-400 hover:bg-opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <Listbox as="div" value={filterByAtomValue} onChange={setFilterByAtomValue} multiple className="relative">
        {({ open }) => (
          <>
            <Listbox.Button className="flex w-full cursor-pointer items-center justify-between gap-2 rounded bg-sky-800 p-2 hover:bg-sky-700">
              <span className="text-left">
                Fields to filter by: <i className="pr-8">{filterByAtomValue.length ? filterByAtomValue.join(", ") : "none"}</i>
              </span>
              {open ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                </svg>
              )}
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 w-full rounded-md bg-slate-700 p-1 shadow-lg">
              {filterByOptions.map((filterByOption) => (
                <Listbox.Option
                  key={filterByOption}
                  value={filterByOption}
                  className={({ active }) => `relative z-10 mb-1 flex cursor-pointer gap-2 rounded px-2 py-1.5 text-slate-100 last:mb-0 ${active && "bg-slate-600"}`}
                >
                  {({ selected }) => (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className={`h-6 w-6 ${!selected && "invisible"}`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {filterByOption}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </>
        )}
      </Listbox>
    </div>
  );
};

const SortForm = () => {
  const [sortAtomValue, setSortAtomValue] = useAtom(sortAtom);

  const handleChangeColumn = (value: PossibleValuesType | null) => {
    if (!value) {
      return setSortAtomValue([]);
    }
    if (!sortAtomValue[0]) {
      return setSortAtomValue([{ id: value.columnId, desc: true }]);
    }
    return setSortAtomValue([{ id: value.columnId, desc: sortAtomValue[0].desc }]);
  };
  const handleChangeDesc = (value: boolean) => {
    if (!sortAtomValue[0]) {
      // This should never happen as we hide this dropdown in this case
      return setSortAtomValue([{ id: "date", desc: value }]);
    }
    return setSortAtomValue([{ id: sortAtomValue[0].id, desc: value }]);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <span className="text-lg font-bold">Sort by:</span>
      <div className="flex gap-4">
        <Listbox value={possibleValues.find((pv) => pv.columnId === sortAtomValue[0]?.id)} onChange={handleChangeColumn} as="div" className="relative flex-1">
          {({ open }) => (
            <>
              <Listbox.Button className="flex w-full cursor-pointer items-center justify-between gap-2 rounded bg-sky-800 p-2 hover:bg-sky-700">
                {!!possibleValues.find((pv) => pv.columnId === sortAtomValue[0]?.id)?.columnName ? (
                  <p>{possibleValues.find((pv) => pv.columnId === sortAtomValue[0]?.id)?.columnName}</p>
                ) : (
                  <i>Column...</i>
                )}
                {open ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                  </svg>
                )}
              </Listbox.Button>
              <Listbox.Options className="absolute z-10 mt-1 w-full rounded-md bg-slate-700 p-1 shadow-lg">
                {possibleValues
                  .filter((value) => sortAtomValue[0]?.id !== value.columnId)
                  .map((value) => (
                    <Listbox.Option
                      key={value.columnId}
                      value={value}
                      className={({ active }) => `relative z-10 mb-1 cursor-pointer rounded px-2 py-1.5 text-slate-100 last:mb-0 ${active && "bg-slate-600"}`}
                    >
                      {value.columnName}
                    </Listbox.Option>
                  ))}
                <Listbox.Option
                  key="column-none"
                  value={null}
                  className={({ active }) => `relative z-10 mb-1 cursor-pointer rounded px-2 py-1.5 text-slate-100 last:mb-0 ${active && "bg-slate-600"}`}
                >
                  <i>None...</i>
                </Listbox.Option>
              </Listbox.Options>
            </>
          )}
        </Listbox>

        {!!sortAtomValue[0] && (
          <Listbox value={sortAtomValue[0].desc} onChange={handleChangeDesc} as="div" className="relative flex-1">
            {({ open }) => (
              <>
                <Listbox.Button className="flex w-full cursor-pointer items-center justify-between gap-2 rounded bg-sky-800 p-2 hover:bg-sky-700">
                  <p>{sortAtomValue[0]?.desc ? "Descending" : "Ascending"}</p>
                  {open ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                    </svg>
                  )}
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-1 w-full rounded-md bg-slate-700 p-1 shadow-lg">
                  <Listbox.Option
                    key="true"
                    value={true}
                    className={({ active }) => `relative z-10 mb-1 cursor-pointer rounded px-2 py-1.5 text-slate-100 last:mb-0 ${active && "bg-slate-600"}`}
                  >
                    Descending
                  </Listbox.Option>
                  <Listbox.Option
                    key="false"
                    value={false}
                    className={({ active }) => `relative z-10 mb-1 cursor-pointer rounded px-2 py-1.5 text-slate-100 last:mb-0 ${active && "bg-slate-600"}`}
                  >
                    Ascending
                  </Listbox.Option>
                </Listbox.Options>
              </>
            )}
          </Listbox>
        )}
      </div>
    </div>
  );
};

const TableControls = () => {
  const setGroupColumnsAtomValue = useSetAtom(groupColumnsAtom);
  const [filterAtomValue, setFilterAtomValue] = useAtom(filterAtom);

  return (
    <Disclosure as="div" className="mb-2 w-full">
      {({ open }) => (
        <>
          <div className="flex flex-col justify-between gap-2 sm:flex-row">
            <Disclosure.Button className={`flex items-center gap-2 rounded border border-sky-800 bg-sky-800 p-2 hover:bg-sky-700 ${open && "rounded-b-none border-b-0"}`}>
              <span>Table options</span>
              {open ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                </svg>
              )}
            </Disclosure.Button>
            {!!filterAtomValue.length && !open && (
              <div className="flex items-center justify-between gap-4 rounded-md border border-sky-800 bg-slate-700 bg-opacity-20 p-1">
                <div className="flex gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                  <p>Filters applied</p>
                </div>
                <button
                  className="flex h-8 items-center justify-center rounded  bg-sky-800 p-2 hover:bg-sky-700"
                  onClick={() => {
                    setGroupColumnsAtomValue([]);
                    setFilterAtomValue("");
                  }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
          <Disclosure.Panel className="flex flex-col gap-8 rounded-md rounded-t-none border border-sky-800 bg-slate-700 bg-opacity-20 p-2 sm:flex-row sm:rounded-tr">
            <GroupForm />
            <FilterForm />
            <span className="sm:hidden">
              <SortForm />
            </span>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default TableControls;
