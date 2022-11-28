import React, { useState, type Dispatch, type SetStateAction } from "react";
import { type Transaction } from "@prisma/client";
import { Listbox } from "@headlessui/react";

interface YearSelectorProps {
  transactions: Transaction[];
  setPeriodStart: Dispatch<SetStateAction<Date>>;
  setPeriodEnd: Dispatch<SetStateAction<Date>>;
}

const YearSelector: React.FC<YearSelectorProps> = ({ transactions, setPeriodStart, setPeriodEnd }) => {
  const [selectedYear, setSelectedYear] = useState<string>(`${new Date().getFullYear()}`);
  const yearStrings = new Set<string>(transactions.map((transaction) => `${transaction.date.getFullYear()}`));

  const handleSelect = (year: string) => {
    setSelectedYear(year);

    setPeriodStart(new Date(year));
    const yearLater = new Date(year);
    yearLater.setFullYear(yearLater.getFullYear() + 1);
    setPeriodEnd(yearLater);
  };

  return (
    <Listbox value={selectedYear} onChange={handleSelect}>
      <div className="relative">
        <Listbox.Button className="flex w-full cursor-pointer items-center justify-center gap-2 text-3xl font-bold">
          <span>{selectedYear}</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-md bg-slate-800 p-1">
          {[...yearStrings]
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .map((year) => (
              <Listbox.Option
                key={year}
                value={year}
                className={({ active, selected }) =>
                  `relative z-10 mb-1 cursor-pointer rounded px-2 py-1.5 text-slate-100 last:mb-0 ${active && "bg-slate-700"} ${
                    selected && "cursor-default bg-slate-600 font-bold"
                  }`
                }
              >
                <span>{new Date(year).getFullYear()}</span>
              </Listbox.Option>
            ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};

export default YearSelector;
