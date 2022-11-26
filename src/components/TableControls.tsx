import React, { useEffect } from "react";
import { Disclosure, Listbox } from "@headlessui/react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useAtom } from "jotai";
import { groupColumnsAtom, searchAtom } from "../state/atoms";

const GroupForm = () => {
  const [groupColumnsAtomValue, setGroupColumnsAtomValue] = useAtom(groupColumnsAtom);

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

  type GroupFormInputs = {
    groupColumnIds: { columnId: string; columnName: string }[];
  };
  const { control, register } = useForm<GroupFormInputs>({
    defaultValues: { groupColumnIds: groupColumnsAtomValue.map((av) => possibleValues.find((pv) => pv.columnId === av)) },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "groupColumnIds" });
  const currentFormVales = useWatch({ control, name: "groupColumnIds" });

  useEffect(() => {
    setGroupColumnsAtomValue(currentFormVales.map((gcid) => gcid.columnId));
  }, [currentFormVales, setGroupColumnsAtomValue]);

  return (
    <div className="flex w-full flex-col gap-2">
      <span className="text-lg font-bold">Group rows by:</span>
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

      <Listbox onChange={append} as="div" className="relative w-max">
        {({ open }) => (
          <>
            <Listbox.Button className="flex cursor-pointer items-center justify-center gap-2 rounded bg-lime-800 p-2 hover:bg-lime-700">
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
                .filter((value) => !currentFormVales.some((currentValue) => currentValue.columnId === value.columnId))
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
    </div>
  );
};

const FilterForm = () => {
  const [searchAtomValue, setSearchAtomValue] = useAtom(searchAtom);

  return (
    <div className="flex w-full flex-col gap-2">
      <span className="text-lg font-bold">Filter rows by:</span>
      <div className="relative">
        <input className="w-full p-2" value={searchAtomValue.join(" ")} onChange={(e) => setSearchAtomValue(e.target.value.split(" "))} placeholder="Type keywords..." />
        {!!searchAtomValue.length && (
          <div className="absolute right-0 top-0 flex h-full justify-end p-1">
            <button
              onClick={() => setSearchAtomValue([])}
              className="flex h-8 w-8 items-center justify-center rounded bg-red-500 bg-opacity-50 p-2 hover:bg-red-400 hover:bg-opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const TableControls = () => {
  return (
    <Disclosure as="div" className="mb-2 w-full">
      {({ open }) => (
        <>
          <Disclosure.Button className="flex items-center gap-2 rounded bg-lime-800 p-2 hover:bg-lime-700">
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
          <Disclosure.Panel className="flex flex-col gap-8 rounded bg-slate-700 bg-opacity-20 p-2 sm:flex-row">
            <GroupForm />
            <FilterForm />
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default TableControls;
