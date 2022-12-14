import React from "react";
import { type Category } from "@prisma/client";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "../server/trpc/router/_app";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { formatNumber } from "../utils/currencyFormat";

interface ChartjsBarProps {
  transactionsData: inferRouterOutputs<AppRouter>["transaction"]["getAll"];
  periodStart: Date;
  periodEnd: Date;
}
const ChartjsBar: React.FC<ChartjsBarProps> = ({ transactionsData, periodStart, periodEnd }) => {
  ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const groupByCategory = (data: inferRouterOutputs<AppRouter>["transaction"]["getAll"]) => {
    const result = data
      .filter((t) => t.date.getTime() >= periodStart.getTime() && t.date.getTime() < periodEnd.getTime())
      .reduce((grouped, t) => {
        const foundCategory = grouped.find((matching) => {
          if (!t.category) {
            return t.isExpense ? matching.category.id === "none_expense" : matching.category.id === "none_income";
          }
          return matching.category.id === t.categoryId;
        });

        if (!foundCategory) {
          const noCategoryCategory = { color: "#666666", isExpense: t.isExpense, name: "-", createdAt: new Date(), updatedAt: new Date(), icon: "" };
          const noCategoryCategoryToPush = t.isExpense ? { id: "none_expense", ...noCategoryCategory } : { id: "none_income", ...noCategoryCategory };
          grouped.push({
            category: t.category || noCategoryCategoryToPush,
            data: [{ monthIndex: t.date.getMonth(), calculatedValue: t.value * t.fxRate }],
          });
        } else {
          const foundMonthInCategory = foundCategory.data.find((matching) => matching.monthIndex === t.date.getMonth());

          if (!foundMonthInCategory) {
            foundCategory.data.push({ monthIndex: t.date.getMonth(), calculatedValue: t.value * t.fxRate });
          } else {
            foundMonthInCategory.calculatedValue += t.value * t.fxRate;
          }
        }
        return grouped;
      }, [] as { category: Category; data: { monthIndex: number; calculatedValue: number }[] }[]);

    const savingsCategory = { id: "savings", name: "Savings", color: "#84cc16", isExpense: false, createdAt: new Date(), updatedAt: new Date(), icon: "" };
    const savings = result.reduce((grouped, category) => {
      category.data.forEach((d) => {
        const found = grouped.find((monthData) => monthData.monthIndex === d.monthIndex);
        if (!found) {
          grouped.push({ monthIndex: d.monthIndex, calculatedValue: category.category.isExpense ? -d.calculatedValue : d.calculatedValue });
        } else {
          found.calculatedValue += category.category.isExpense ? -d.calculatedValue : d.calculatedValue;
        }
      });
      return grouped;
    }, [] as { monthIndex: number; calculatedValue: number }[]);
    result.push({ category: savingsCategory, data: savings });

    result.forEach((c) => {
      const copy: { monthIndex: number; calculatedValue: number }[] = [];
      c.data.forEach((cc) => (copy[cc.monthIndex] = cc));
      c.data = copy;
    });

    return result;
  };

  const groupedTransactionsData = groupByCategory(transactionsData);

  return (
    <div className="relative mx-auto h-[512px] w-full">
      <Bar
        data={{
          labels: monthNames,
          datasets: groupedTransactionsData.map((t) => ({
            label: t.category.name,
            data: t.data.map((d) => (t.category.id !== "savings" ? d.calculatedValue : d.calculatedValue > 0 ? d.calculatedValue : 0)),
            backgroundColor: `${t.category?.color}99`,
            hoverBackgroundColor: t.category?.color,
            borderColor: t.category?.color,
            hoverBorderColor: t.category?.color,
            borderWidth: 2,
            stack: t.category.id === "savings" ? "savings" : t.category.isExpense ? "expenses" : "incomes",
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
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
              usePointStyle: true,
              boxPadding: 10,
              bodyAlign: "right",
              bodySpacing: 10,
              callbacks: {
                label: (ctx) => (ctx.parsed.y !== null ? `${ctx.dataset.label}: ${ctx.dataset.stack === "expenses" ? "-" : ""}${formatNumber(ctx.parsed.y)} zł` : ""),
                labelTextColor: (ctx) => `${ctx.dataset.stack === "savings" ? "#fff" : ctx.dataset.stack === "expenses" ? "#f87171" : "#a3e635"}`,
                labelPointStyle: () => ({ pointStyle: "rectRounded", rotation: 0 }),
              },
              itemSort: (a, b) =>
                Number(b.dataset.stack === "incomes") - Number(a.dataset.stack === "incomes") || Number(b.dataset.stack === "expenses") - Number(a.dataset.stack === "expenses"),
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
          interaction: {
            mode: "index" as const,
            intersect: false,
          },
          scales: {
            x: {
              stacked: true,
              border: {
                color: "#fff",
              },
              grid: {
                color: "#333",
              },
            },
            y: {
              stacked: true,
              border: {
                color: "#fff",
              },
              grid: {
                color: "#333",
              },
            },
          },
        }}
      />
    </div>
  );
};

export default ChartjsBar;
