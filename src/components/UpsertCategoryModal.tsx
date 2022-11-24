import React, { type Dispatch, type SetStateAction } from "react";
import { type Category } from "@prisma/client";
import { Dialog } from "@headlessui/react";
import { trpc } from "../utils/trpc";
import { useForm, type SubmitHandler } from "react-hook-form";
import cuid from "cuid";

interface UpsertCategoryModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  editingCategory?: Category;
}

const UpsertCategoryModal: React.FC<UpsertCategoryModalProps> = ({ isOpen, setIsOpen, editingCategory }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Category>({
    defaultValues: editingCategory || {
      id: cuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      color: "#334155",
      icon: "",
      name: "",
      isExpense: true,
    },
  });

  const utils = trpc.useContext();
  const { mutate: mutateUpsertCategory } = trpc.category.upsert.useMutation({
    onMutate: async ({ id, name, color, icon, isExpense }) => {
      await utils.category.getAll.cancel();
      const previousCategories = utils.category.getAll.getData();
      if (previousCategories) {
        utils.category.getAll.setData([
          ...(editingCategory ? previousCategories.filter((t) => t.id !== id) : previousCategories),
          {
            id,
            createdAt: editingCategory?.createdAt || new Date(),
            updatedAt: new Date(),
            name,
            color,
            icon,
            isExpense,
          },
        ]);
      }
      return previousCategories;
    },
    onError: (error, variables, context) => {
      utils.category.getAll.setData(context);
    },
    onSuccess: () => utils.category.getAll.invalidate(),
  });

  const handleAdd: SubmitHandler<Category> = (data) => {
    setIsOpen(false);
    const { id, name, color, icon, isExpense } = data;
    mutateUpsertCategory({
      id,
      name,
      color,
      icon,
      isExpense,
    });
  };

  return (
    <Dialog as="div" className="relative z-10 text-slate-50" open={isOpen} onClose={() => setIsOpen(false)}>
      <div className="fixed inset-0 bg-black bg-opacity-70" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-700 p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title as="h3" className="text-2xl font-bold leading-6">
              {editingCategory ? "Edit category" : "Add new category"}
            </Dialog.Title>

            <form onSubmit={handleSubmit(handleAdd)} className="mt-8 flex flex-col gap-4">
              <input type="hidden" {...register("id", { required: true })} />
              
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

              <div className="flex justify-between gap-2">
                {/* COLOR: */}
                <label className="flex w-full flex-col">
                  <span>Color:</span>
                  <input
                    type="color"
                    {...register("color", {
                      required: {
                        value: true,
                        message: "Value can't be empty...",
                      },
                    })}
                    className="h-full w-full"
                  />
                  {errors.color && <span className="text-red-500">{errors.color.message}</span>}
                </label>

                {/* ICON: */}
                <label className="flex flex-col">
                  <span>Icon:</span>
                  <input type="text" {...register("icon")} className={`${errors.icon && "border border-red-500"}`} />
                  {errors.icon && <span className="text-red-500">{errors.icon.message}</span>}
                </label>
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
                {errors.name && <span className="text-red-500">{errors.name.message}</span>}
              </label>

              <div className="mt-8 flex w-full gap-2">
                <button onClick={() => setIsOpen(false)} className="text-ared-700 grow rounded border border-red-700 px-3 py-2 font-semibold hover:bg-red-600">
                  Cancel
                </button>
                <button type="submit" className="grow rounded bg-lime-700 px-3 py-2 font-semibold hover:bg-lime-600">
                  {editingCategory ? "Save" : "Add"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default UpsertCategoryModal;
