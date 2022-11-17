import React from "react";

interface DoughnutProps {
  income: number;
  expense: number;
}

const Doughnut: React.FC<DoughnutProps> = ({ income, expense }) => {
  const size = 200;
  const center = size / 2;
  const width = 50;
  const radius = center - width / 2;
  const fullCircle = 2 * Math.PI * radius;
  const dashArray = `${(expense / (income || 1)) * fullCircle} 
    ${(1 - expense / (income || 1)) * fullCircle}`;
  const total = income - expense;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <h1
          className={`text-5xl font-extrabold
            ${total === 0 && "text-slate-400"}
            ${total < 0 && "text-red-400"}
            ${total > 0 && "text-lime-500"}`}
        >
          {total.toFixed(2)} zł
        </h1>
        <div className="flex w-full justify-between gap-8">
          <h3 className="text-lime-400">{income.toFixed(2)} zł</h3>
          <h3 className="text-right text-red-400">-{expense.toFixed(2)} zł</h3>
        </div>
      </div>
      <svg className="-rotate-90" style={{ width: size, height: size }}>
        <circle
          className="fill-transparent stroke-lime-700"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={width}
        />
        <circle
          className="fill-transparent stroke-red-700"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={width}
          strokeDasharray={dashArray}
        />
      </svg>
    </div>
  );
};

export default Doughnut;
