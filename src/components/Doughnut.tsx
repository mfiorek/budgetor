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

  return (
    <div className="flex flex-col items-center gap-4">
      <svg className="-rotate-90" style={{ width: size, height: size }}>
        <circle className="fill-transparent stroke-lime-700" cx={center} cy={center} r={radius} strokeWidth={width} />
        <circle className="fill-transparent stroke-red-700" cx={center} cy={center} r={radius} strokeWidth={width} strokeDasharray={dashArray} />
      </svg>
    </div>
  );
};

export default Doughnut;
