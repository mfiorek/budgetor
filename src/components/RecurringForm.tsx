import React from "react";
import { useRouter } from "next/router";
import { type Category, type RecurringTransaction } from "@prisma/client";
import { type SubmitHandler, useForm } from "react-hook-form";
import cuid from "cuid";
import { trpc } from "../utils/trpc";

interface RecurringFormProps {
  editingRecurring?: RecurringTransaction;
  categoriesData: Category[];
}

const RecurringForm: React.FC<RecurringFormProps> = ({ editingRecurring, categoriesData }) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    // existence of touchedFields somehow fixes issue with categoryId being set to null on first keystoke
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    formState: { errors, touchedFields },
  } = useForm<RecurringTransaction>({
    defaultValues: editingRecurring
      ? { ...editingRecurring }
      : {
          id: cuid(),
          isExpense: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          categoryId: undefined,
          name: "",
          dayOfMonth: undefined,
          value: undefined,
        },
  });

  const utils = trpc.useContext();
  const { mutate: mutateUpsertTransacion } = trpc.recurringTransaction.upsert.useMutation({
    onMutate: async ({ id, isExpense, name, categoryId, dayOfMonth, value }) => {
      await utils.recurringTransaction.getAll.cancel();
      const previousRecurrings = utils.recurringTransaction.getAll.getData();
      const previousCategories = utils.category.getAll.getData();
      if (previousRecurrings && previousCategories) {
        utils.recurringTransaction.getAll.setData([
          ...(editingRecurring ? previousRecurrings.filter((t) => t.id !== id) : previousRecurrings),
          {
            id,
            isExpense,
            name,
            categoryId,
            dayOfMonth,
            value,
            createdAt: editingRecurring?.createdAt || new Date(),
            updatedAt: new Date(),
            category: previousCategories.find((category) => category.id === categoryId) || null,
          },
        ]);
      }
      return previousRecurrings;
    },
    onError: (error, variables, context) => {
      utils.recurringTransaction.getAll.setData(context);
    },
    onSuccess: () => utils.recurringTransaction.getAll.invalidate(),
  });

  const handleAdd: SubmitHandler<RecurringTransaction> = (data) => {
    router.back();
    const { id, isExpense, name, categoryId, dayOfMonth, value } = data;
    mutateUpsertTransacion({
      id,
      isExpense,
      name,
      categoryId,
      dayOfMonth,
      value,
    });
  };

  return (
    <div className="w-full max-w-2xl text-left">
      <h3 className="text-2xl font-bold leading-6">{editingRecurring ? "Edit recurring transaction" : "Add new recurring transaction"}</h3>

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
            className="flex w-14 cursor-pointer appearance-none rounded-full bg-lime-300 bg-opacity-20 p-1 transition duration-200
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

        {/* DAY OF MONTH: */}
        <label className="flex flex-col">
          <span>Day of month:</span>
          <input
            type="number"
            {...register("dayOfMonth", {
              required: {
                value: true,
                message: "Day of month can't be empty...",
              },
              max: {
                value: 31,
                message: "Maximum day of month is 31",
              },
              min: {
                value: 1,
                message: "Minimum day of month is 1",
              },
              valueAsNumber: true,
            })}
            className={`${errors.dayOfMonth && "border border-red-500"}`}
          />
          {errors.dayOfMonth && <span className="text-red-500">{errors.dayOfMonth.message}</span>}
        </label>

        <div className="mt-8 flex w-full gap-2">
          <button type="button" onClick={router.back} className="text-ared-700 grow rounded border border-red-700 px-3 py-2 font-semibold hover:bg-red-600">
            Cancel
          </button>
          <button type="submit" className="grow rounded bg-lime-700 px-3 py-2 font-semibold hover:bg-lime-600">
            {editingRecurring ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecurringForm;
