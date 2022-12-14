import React from "react";
import { type Category } from "@prisma/client";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "../server/trpc/router/_app";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { formatNumber } from "../utils/currencyFormat";

interface ChartjsDoughnutProps {
  transactionsData: inferRouterOutputs<AppRouter>["transaction"]["getAll"];
  periodStart: Date;
  periodEnd: Date;
  income: number;
  expense: number;
}
const ChartjsDoughnut: React.FC<ChartjsDoughnutProps> = ({ transactionsData, periodStart, periodEnd, income, expense }) => {
  ChartJS.register(ArcElement, Tooltip, Legend);

  const groupByCategory = (data: inferRouterOutputs<AppRouter>["transaction"]["getAll"]) => {
    const result = data
      .filter((t) => t.date.getTime() >= periodStart.getTime() && t.date.getTime() < periodEnd.getTime())
      .filter((t) => t.isExpense)
      .reduce((grouped, t) => {
        const found = grouped.find((matching) => (t.category ? matching.category?.id === t.categoryId : matching.category?.id === ""));
        if (!found) {
          grouped.push({
            category: t.category || ({ id: "", name: "-", color: "#666666" } as Category),
            isExpense: t.isExpense,
            calculatedValue: t.isExpense ? -t.value * t.fxRate : t.value * t.fxRate,
          });
        } else {
          found.calculatedValue += t.isExpense ? -t.value * t.fxRate : t.value * t.fxRate;
        }
        return grouped;
      }, [] as { category: Category | null; isExpense: boolean; calculatedValue: number }[]);

    if (income - expense > 0) {
      result.push({ category: { name: "Savings", color: "#3f6212" } as Category, isExpense: false, calculatedValue: income - expense });
    }
    return result.sort((a, b) => a.calculatedValue - b.calculatedValue);
  };

  const groupedTransactionsData = groupByCategory(transactionsData);

  return (
    <div className="relative mx-auto h-96 w-full">
      <Doughnut
        data={{
          labels: groupedTransactionsData.map((cat) => cat.category?.name || "-"),
          datasets: [
            {
              data: groupedTransactionsData.map((gta) => gta.calculatedValue),
              backgroundColor: groupedTransactionsData.map((c) => `${c.category?.color}99`),
              borderColor: groupedTransactionsData.map((c) => c.category?.color),
              hoverBackgroundColor: groupedTransactionsData.map((c) => c.category?.color),
              borderWidth: 2,
              hoverOffset: 50,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          radius: "95%",
          cutout: "60%",
          layout: {
            padding: {
              top: 10,
            },
          },
          plugins: {
            tooltip: {
              backgroundColor: "#1e293b",
              borderColor: "#475569",
              borderWidth: 1,
              padding: 12,
              titleFont: {
                size: 16,
              },
              bodyFont: {
                size: 16,
              },
              displayColors: false,
              bodyAlign: "right",
              callbacks: {
                label: (ctx) => `${formatNumber(ctx.parsed)} zł`,
                labelTextColor: (x) => `${x.parsed >= 0 ? "#a3e635" : "#f87171"}`,
              },
              caretSize: 8,
            },
            legend: {
              position: "bottom",
              labels: {
                font: {
                  size: 16,
                },
                usePointStyle: true,
                pointStyle: "rectRounded",
                padding: 20,
              },
            },
          },
        }}
      />
    </div>
  );
};

export default ChartjsDoughnut;
