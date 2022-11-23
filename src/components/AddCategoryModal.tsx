import React, { type Dispatch, type SetStateAction } from "react";
import { type Category } from "@prisma/client";
import { Dialog } from "@headlessui/react";
import { trpc } from "../utils/trpc";
import { useForm, type SubmitHandler } from "react-hook-form";
import cuid from "cuid";

interface AddCategoryModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, setIsOpen }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Category>({
    defaultValues: {
      id: cuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      color: "#334155",
      iconSrc: "",
      name: "",
    },
  });

  const utils = trpc.useContext();
  const { mutate: mutateAddCategory } = trpc.category.add.useMutation({
    onMutate: async ({ id, name, color, iconSrc }) => {
      await utils.category.getAll.cancel();
      const previousCategories = utils.category.getAll.getData();
      if (previousCategories) {
        utils.category.getAll.setData([
          ...previousCategories,
          {
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
            name,
            color,
            iconSrc,
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
    const { id, name, color, iconSrc } = data;
    mutateAddCategory({
      id,
      name,
      color,
      iconSrc,
    });
  };

  return (
    <Dialog as="div" className="relative z-10 text-slate-50" open={isOpen} onClose={() => setIsOpen(false)}>
      <div className="fixed inset-0 bg-black bg-opacity-70" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-700 p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title as="h3" className="text-2xl font-bold leading-6">
              Add new category
            </Dialog.Title>

            <form onSubmit={handleSubmit(handleAdd)} className="mt-8 flex flex-col gap-4">
              <input type="hidden" {...register("id", { required: true })} />

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
                  <input type="text" {...register("iconSrc")} className={`${errors.iconSrc && "border border-red-500"}`} />
                  {errors.iconSrc && <span className="text-red-500">{errors.iconSrc.message}</span>}
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
                  Add
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default AddCategoryModal;
