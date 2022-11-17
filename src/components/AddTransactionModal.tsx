import React, { type Dispatch, type SetStateAction } from "react";
import cuid from "cuid";
import { Dialog } from "@headlessui/react";
import { trpc } from "../utils/trpc";
import { useForm, type SubmitHandler } from "react-hook-form";
import { type Transaction } from "@prisma/client";

interface AddTransactionModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Transaction>({
    defaultValues: {
      id: cuid(),
      isExpense: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const utils = trpc.useContext();
  const { mutate } = trpc.transaction.add.useMutation({
    onMutate: async ({ id, isExpense, name, category, date, value }) => {
      await utils.transaction.getAll.cancel();
      const previousTransacions = utils.transaction.getAll.getData();
      if (previousTransacions) {
        utils.transaction.getAll.setData([
          ...previousTransacions,
          {
            id,
            isExpense,
            name,
            category,
            date,
            value,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }
      return previousTransacions;
    },
    onError: (error, variables, context) => {
      utils.transaction.getAll.setData(context);
    },
    onSuccess: () => utils.transaction.getAll.invalidate(),
  });

  const handleAdd: SubmitHandler<Transaction> = (data) => {
    setIsOpen(false);
    const { id, isExpense, name, category, date, value } = data;
    mutate({
      id,
      isExpense,
      name,
      category,
      date,
      value,
    });
    reset();
  };

  return (
    <Dialog
      as="div"
      className="relative z-10 text-neutral-50"
      open={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <div className="fixed inset-0 bg-black bg-opacity-25" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-neutral-700 p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title as="h3" className="text-2xl font-bold leading-6">
              Add new transaction
            </Dialog.Title>

            <form
              onSubmit={handleSubmit(handleAdd)}
              className="mt-8 flex flex-col gap-4"
            >
              <input type="hidden" {...register("id", { required: true })} />
              <input
                type="hidden"
                {...register("createdAt", { required: true })}
              />
              <input
                type="hidden"
                {...register("updatedAt", { required: true })}
              />

              {/* IS_EXPENSE: */}
              <div className="flex justify-center gap-4">
                <span
                  onClick={() =>
                    setValue("isExpense", false, { shouldDirty: true })
                  }
                  className={`cursor-pointer text-xl font-bold text-lime-600 transition-all duration-200 ${
                    watch("isExpense") && "opacity-50"
                  }`}
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
                  onClick={() =>
                    setValue("isExpense", true, { shouldDirty: true })
                  }
                  className={`cursor-pointer text-xl font-bold text-red-600 transition-all duration-200 ${
                    !watch("isExpense") && "opacity-50"
                  }`}
                >
                  Expense
                </span>
              </div>

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
                {errors.name && (
                  <span className="text-red-500">{errors.name.message}</span>
                )}
              </label>

              {/* CATEGORY: */}
              <label className="flex flex-col">
                <span>Category:</span>
                <input
                  type="text"
                  {...register("category", {
                    required: {
                      value: true,
                      message: "Category can't be empty...",
                    },
                  })}
                />
                {errors.category && (
                  <span className="text-red-500">
                    {errors.category.message}
                  </span>
                )}
              </label>

              {/* VALUE: */}
              <label className="flex flex-col">
                <span>Value:</span>
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
                />
                {errors.value && (
                  <span className="text-red-500">{errors.value.message}</span>
                )}
              </label>

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
                    valueAsDate: true,
                  })}
                  defaultValue={`${new Date().getFullYear()}-${
                    new Date().getMonth() + 1
                  }-${new Date().getDate()}`}
                />
                {errors.date && (
                  <span className="text-red-500">{errors.date.message}</span>
                )}
              </label>

              <div className="mt-8 flex justify-end gap-2">
                <button
                  type="submit"
                  className="rounded bg-lime-700 px-3 py-1 font-semibold hover:bg-lime-600"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    reset();
                  }}
                  className="rounded bg-red-700 px-3 py-1 font-semibold hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default AddTransactionModal;
