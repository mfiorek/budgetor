import React from "react";
import { type Category } from "@prisma/client";
import { trpc } from "../utils/trpc";
import { Menu } from "@headlessui/react";
import Link from "next/link";

interface CategoryListElementProps {
  category: Category;
}

const CategoryListElement: React.FC<CategoryListElementProps> = ({ category }) => {
  const utils = trpc.useContext();
  const { mutate: mutateDeleteCategory } = trpc.category.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.category.getAll.cancel();
      const previousCategories = utils.category.getAll.getData();
      if (previousCategories) {
        utils.category.getAll.setData(previousCategories.filter((t) => t.id !== id));
      }
      return previousCategories;
    },
    onError: (error, variables, context) => {
      utils.category.getAll.setData(context);
    },
    onSuccess: () => utils.category.getAll.invalidate(),
  });

  return (
    <div
      key={category.id}
      className={`flex min-h-[3rem] select-none items-center justify-between rounded border p-2`}
      style={{ backgroundColor: `${category.color}88`, borderColor: `${category.color}` }}
    >
      <div className="flex items-center gap-2">
        {category.icon && <span className="text-2xl">{category.icon}</span>}
        <span className="text-center" style={{ textShadow: "0px 0px 2px black" }}>
          {category.name}
        </span>
      </div>
      <Menu as="div" className="relative h-6">
        <Menu.Button>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        </Menu.Button>
        <Menu.Items className="absolute right-0 z-10 min-w-max rounded-lg bg-slate-700 p-1">
          <Menu.Item>
            <Link
              href={{ pathname: "/category", query: { id: category.id } }}
              className="mb-1 flex w-full min-w-[7rem] items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-slate-500 hover:bg-opacity-25"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                />
              </svg>
              <span>Edit</span>
            </Link>
          </Menu.Item>
          <Menu.Item
            as="div"
            className="group flex w-full min-w-[7rem] items-center gap-2 rounded px-2 py-1.5 hover:bg-red-500 hover:bg-opacity-50"
            onClick={() => mutateDeleteCategory({ id: category.id })}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className="h-6 w-6 stroke-red-500 group-hover:stroke-slate-200">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
            <span>Delete</span>
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </div>
  );
};

export default CategoryListElement;
