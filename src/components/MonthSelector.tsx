import React, { useState, type Dispatch, type SetStateAction } from "react";
import { type Transaction } from "@prisma/client";
import { Listbox } from "@headlessui/react";
import dateStringHelper from "../utils/dateStringsHelper";

interface MonthSelectorProps {
  transactions: Transaction[];
  setPeriodStart: Dispatch<SetStateAction<Date>>;
  setPeriodEnd: Dispatch<SetStateAction<Date>>;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ transactions, setPeriodStart, setPeriodEnd }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(`${new Date().getFullYear()}-${dateStringHelper.getMonthString(new Date())}`);
  const monthStrings = new Set<string>(transactions.map((transaction) => `${transaction.date.getFullYear()}-${dateStringHelper.getMonthString(transaction.date)}`));
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handleSelect = (month: string) => {
    setSelectedMonth(month);

    setPeriodStart(new Date(month));
    const monthLater = new Date(month);
    monthLater.setMonth(monthLater.getMonth() + 1);
    const monthLaterString = `${monthLater.getFullYear()}-${dateStringHelper.getMonthString(monthLater)}`;
    setPeriodEnd(new Date(monthLaterString));
  };

  return (
    <Listbox value={selectedMonth} onChange={handleSelect}>
      <div className="relative">
        <Listbox.Button className="flex w-full cursor-pointer items-center justify-center gap-2 text-3xl font-bold">
          <span>
            {monthNames[new Date(selectedMonth).getMonth()]} {new Date(selectedMonth).getFullYear()}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-md bg-slate-800 p-1">
          {[...monthStrings]
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .map((month) => (
              <Listbox.Option
                key={month}
                value={month}
                className={({ active, selected }) =>
                  `relative z-10 mb-1 cursor-pointer rounded px-2 py-1.5 text-slate-100 last:mb-0 ${active && "bg-slate-700"} ${
                    selected && "cursor-default bg-slate-600 font-bold"
                  }`
                }
              >
                <span>
                  {monthNames[new Date(month).getMonth()]} {new Date(month).getFullYear()}
                </span>
              </Listbox.Option>
            ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};

export default MonthSelector;
