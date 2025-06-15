import React, { useState, type Dispatch, type SetStateAction } from "react";
import { Listbox } from "@headlessui/react";
import dateStringHelper from "../utils/dateStringsHelper";

function dateRange() {
  let start = new Date("2022-11");
  const end = new Date();
  const dates = [];
  while (start <= end) {
    const displayMonth = start.getUTCMonth() + 1;
    dates.push([start.getUTCFullYear(), displayMonth.toString().padStart(2, "0")].join("-"));

    start = new Date(start.setUTCMonth(displayMonth));
  }

  return dates;
}

interface MonthSelectorProps {
  selectedDate: Date;
  setPeriodStart: Dispatch<SetStateAction<Date>>;
  setPeriodEnd: Dispatch<SetStateAction<Date>>;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedDate, setPeriodStart, setPeriodEnd }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(`${selectedDate.getFullYear()}-${dateStringHelper.getMonthString(selectedDate)}`);
  const monthStrings = dateRange();
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
    <div className="mx-auto w-max">
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
          <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-md border border-slate-600 bg-slate-800 p-1 shadow-lg">
            {[...monthStrings]
              .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
              .map((month) => (
                <Listbox.Option
                  key={month}
                  value={month}
                  className={({ active, selected }) =>
                    `relative z-10 mb-1 cursor-pointer rounded bg-opacity-25 px-2 py-1.5 text-slate-100 last:mb-0 ${active && "bg-slate-600"} ${
                      selected && "cursor-default bg-slate-600 bg-opacity-75 font-bold"
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
    </div>
  );
};

export default MonthSelector;
