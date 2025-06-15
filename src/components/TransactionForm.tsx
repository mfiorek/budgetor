import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { type Category, type Transaction } from "@prisma/client";
import { trpc } from "../utils/trpc";
import { type SubmitHandler, useForm } from "react-hook-form";
import cuid from "cuid";
import dateStringHelper from "../utils/dateStringsHelper";

interface TransactionFormProps {
  editingTransaction?: Transaction;
  categoriesData: Category[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({ editingTransaction, categoriesData }) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setFocus,
    // existence of touchedFields somehow fixes issue with categoryId being set to null on first keystoke
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    formState: { errors, touchedFields },
  } = useForm<Transaction>({
    defaultValues: editingTransaction
      ? { ...editingTransaction, date: undefined }
      : {
          id: cuid(),
          isExpense: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          categoryId: undefined,
          name: "",
          date: undefined,
          value: undefined,
          isFX: false,
          fxRate: undefined,
          fxSymbol: undefined,
        },
  });

  useEffect(() => {
    setFocus("value");
  }, [setFocus]);

  const utils = trpc.useContext();
  const { mutate: mutateUpsertTransacion } = trpc.transaction.upsert.useMutation({
    onMutate: async ({ id, isExpense, name, categoryId, date, value, isFX, fxRate, fxSymbol }) => {
      const monthLater = new Date(date);
      monthLater.setMonth(monthLater.getMonth() + 1);
      const periodStart = new Date(`${date.getFullYear()}-${dateStringHelper.getMonthString(date)}`);
      const periodEnd = new Date(`${monthLater.getFullYear()}-${dateStringHelper.getMonthString(monthLater)}`);

      await utils.transaction.getInDates.cancel({ periodStart, periodEnd });
      const previousTransacions = utils.transaction.getInDates.getData({ periodStart, periodEnd });
      const previousCategories = utils.category.getAll.getData();
      if (previousTransacions && previousCategories) {
        utils.transaction.getInDates.setData({ periodStart, periodEnd }, [
          ...(editingTransaction ? previousTransacions.filter((t) => t.id !== id) : previousTransacions),
          {
            id,
            isExpense,
            name,
            categoryId,
            date,
            value,
            isFX,
            fxRate,
            fxSymbol,
            createdAt: editingTransaction?.createdAt || new Date(),
            updatedAt: new Date(),
            category: previousCategories.find((category) => category.id === categoryId) || null,
            recurringTransactionId: null,
          },
        ]);
      }
      return previousTransacions;
    },
    onError: (error, variables, context) => {
      const monthLater = new Date(variables.date);
      monthLater.setMonth(monthLater.getMonth() + 1);
      const periodStart = new Date(`${variables.date.getFullYear()}-${dateStringHelper.getMonthString(variables.date)}`);
      const periodEnd = new Date(`${monthLater.getFullYear()}-${dateStringHelper.getMonthString(monthLater)}`);

      utils.transaction.getInDates.setData({ periodStart, periodEnd }, context);
    },
    onSuccess: ({ date }) => {
      const monthLater = new Date(date);
      monthLater.setMonth(monthLater.getMonth() + 1);
      const periodStart = new Date(`${date.getFullYear()}-${dateStringHelper.getMonthString(date)}`);
      const periodEnd = new Date(`${monthLater.getFullYear()}-${dateStringHelper.getMonthString(monthLater)}`);

      utils.transaction.getInDates.invalidate({ periodStart, periodEnd });
    },
  });

  const handleAdd: SubmitHandler<Transaction> = (data) => {
    router.back();
    const { id, isExpense, name, categoryId, date, value, isFX, fxRate, fxSymbol } = data;
    mutateUpsertTransacion({
      id,
      isExpense,
      name,
      categoryId,
      date,
      value,
      isFX,
      fxRate: isFX ? fxRate : 1,
      fxSymbol: isFX ? fxSymbol : null,
    });
  };

  const getDateStringForInput = () => {
    if (editingTransaction) {
      const monthString = dateStringHelper.getMonthString(editingTransaction.date);
      const dayString = dateStringHelper.getDayString(editingTransaction.date);
      return `${editingTransaction.date.getFullYear()}-${monthString}-${dayString}`;
    }
    const monthString = dateStringHelper.getMonthString(new Date());
    const dayString = dateStringHelper.getDayString(new Date());
    return `${new Date().getFullYear()}-${monthString}-${dayString}`;
  };

  return (
    <div className="w-full max-w-2xl text-left">
      <h3 className="text-2xl font-bold leading-6">{editingTransaction ? "Edit transaction" : "Add new transaction"}</h3>

      <form onSubmit={handleSubmit(handleAdd)} className="mt-8 flex flex-col gap-4">
        <input type="hidden" {...register("id", { required: true })} />
        <input type="hidden" {...register("createdAt", { required: true })} />
        <input type="hidden" {...register("updatedAt", { required: true })} />

        {/* IS_EXPENSE: */}
        <div className="flex justify-center gap-4">
          <span
            onClick={() => setValue("isExpense", false, { shouldDirty: true })}
            className={`cursor-pointer text-xl font-bold text-lime-600 transition-all duration-200 ${watch("isExpense") && "opacity-50"}`}
          >
            Income
          </span>
          <input
            id="isExpense"
            type="checkbox"
            {...register("isExpense")}
            className="flex h-8 w-14 cursor-pointer appearance-none rounded-full bg-lime-300 bg-opacity-20 p-1 transition duration-200
          before:grid before:h-6 before:w-6 before:rounded-full before:bg-lime-500 before:transition-all before:duration-200
          checked:bg-red-300 checked:bg-opacity-20
          checked:before:translate-x-6 checked:before:bg-red-500"
          />
          <span
            onClick={() => setValue("isExpense", true, { shouldDirty: true })}
            className={`cursor-pointer text-xl font-bold text-red-600 transition-all duration-200 ${!watch("isExpense") && "opacity-50"}`}
          >
            Expense
          </span>
        </div>

        {/* VALUE: */}
        <label className="flex flex-col">
          <input
            type="number"
            step="0.01"
            {...register("value", {
              required: {
                value: true,
                message: "Value can't be empty...",
              },
              valueAsNumber: true,
              min: {
                value: 0,
                message: "Please provide positive value",
              },
            })}
            defaultValue={Number(0).toFixed(2)}
            onBeforeInput={() => {
              if (watch("value") === 0) {
                setValue("value", NaN);
              }
            }}
            className={`bg-transparent text-center text-6xl font-bold [appearance:textfield] ${watch("isExpense") ? "text-red-600" : "text-lime-600"}`}
          />
          {errors.value && <span className="text-red-500">{errors.value.message}</span>}
        </label>

        {/* NAME: */}
        <label className="flex flex-col">
          <span>Name:</span>
          <input
            type="text"
            {...register("name", {
              required: {
                value: true,
                message: "Name can't be empty...",
              },
            })}
            className={`${errors.name && "border border-red-500"}`}
          />
          {errors.name && <span className="text-red-500">{errors.name.message}</span>}
        </label>

        {/* CATEGORY: */}
        <div className="flex flex-col">
          <span>Category:</span>
          <div className="grid grid-cols-4 gap-2">
            {categoriesData
              .filter((category) => category.isExpense === watch("isExpense"))
              .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
              .map((category) => (
                <label
                  key={category.id}
                  className={`flex w-full select-none flex-col items-center justify-center rounded p-2 ${
                    watch("categoryId") === category.id ? "opacity-100 shadow-md shadow-slate-800" : "opacity-50"
                  }`}
                  style={{ backgroundColor: `${category.color}${watch("categoryId") === category.id ? "FF" : "66"}` }}
                >
                  <input type="radio" {...register("categoryId")} value={category.id} className="hidden" />
                  <span className="text-2xl">{category.icon}</span>
                  <span className={`text-center ${watch("categoryId") === category.id && "font-bold"}`} style={{ textShadow: "0px 0px 2px black" }}>
                    {category.name}
                  </span>
                </label>
              ))}
          </div>
        </div>

        {/* DATE: */}
        <label className="flex flex-col">
          <span>Date:</span>
          <input
            type="date"
            {...register("date", {
              required: {
                value: true,
                message: "Date can't be empty...",
              },
              validate: (value) => !isNaN(value.getTime()) || "Date is invalid...",
              valueAsDate: true,
            })}
            defaultValue={getDateStringForInput()}
            className={`${errors.date && "border border-red-500"}`}
          />
          {errors.date && <span className="text-red-500">{errors.date.message}</span>}
        </label>

        {/* FX: */}
        <div className="mt-6 flex flex-col gap-2 overflow-hidden rounded border border-sky-500">
          {/* isFX: */}
          <label className="flex items-center gap-2 bg-sky-800 p-2">
            <input
              id="isFX"
              type="checkbox"
              {...register("isFX")}
              className="flex h-6 w-12 cursor-pointer appearance-none rounded-full bg-slate-700 p-0.5 transition duration-200
                  before:grid before:h-5 before:w-5 before:rounded-full before:bg-slate-400 before:transition-all before:duration-200
                  checked:bg-lime-800 checked:before:translate-x-6 checked:before:bg-lime-500"
            />
            <span>Foreign currency?</span>
          </label>

          {watch("isFX") && (
            <div className="flex gap-2 p-2">
              {/* fxSymbol: */}
              <label className="flex flex-1 flex-col">
                <span>Currency symbol:</span>
                <input type="text" {...register("fxSymbol")} />
              </label>

              {/* fxRate: */}
              <label className="flex flex-1 flex-col">
                <span>Exchange rate:</span>
                <input
                  type="number"
                  step="0.01"
                  {...register("fxRate", {
                    required: {
                      value: watch("isFX"),
                      message: "Exchange rate can't be empty...",
                    },
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: "Please provide positive value",
                    },
                  })}
                  className={`${errors.fxRate && "border border-red-500"}`}
                />
                {errors.fxRate && <span className="text-red-500">{errors.fxRate.message}</span>}
              </label>
            </div>
          )}
        </div>

        <div className="mt-8 flex w-full gap-2">
          <button type="button" onClick={router.back} className="text-ared-700 flex-1 rounded border border-red-700 px-3 py-2 font-semibold hover:bg-red-600">
            Cancel
          </button>
          <button type="submit" className="flex-1 rounded bg-lime-700 px-3 py-2 font-semibold hover:bg-lime-600">
            {editingTransaction ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
