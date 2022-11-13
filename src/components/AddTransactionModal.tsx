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
    formState: { errors },
  } = useForm<Transaction>();

  const utils = trpc.useContext();
  const { mutate } = trpc.transaction.add.useMutation({
    onMutate: async ({ name, category, date, value }) => {
      await utils.transaction.getAll.cancel();
      const previousTransacions = utils.transaction.getAll.getData();
      if (previousTransacions) {
        utils.transaction.getAll.setData([
          ...previousTransacions,
          {
            id: cuid(),
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
  });

  const handleAdd: SubmitHandler<Transaction> = (data) => {
    setIsOpen(false);
    const { name, category, date, value } = data;
    mutate({
      name,
      category,
      date: new Date(date),
      value: parseFloat(value.toString()),
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
              <input
                type="hidden"
                {...register("id", { required: true })}
                defaultValue={cuid()}
              />
              <input
                type="hidden"
                {...register("createdAt", { required: true })}
                defaultValue={new Date().toString()}
              />
              <input
                type="hidden"
                {...register("updatedAt", { required: true })}
                defaultValue={new Date().toString()}
              />

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
                  })}
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
