import { atom } from "jotai";

export const groupColumnsAtom = atom<string[]>([]);
export const filterAtom = atom<string[]>([]);
export const filterByAtom = atom<string[]>(['Name', 'Category', 'Value', 'Date']);
export const sortAtom = atom<{ id: string, desc: boolean }[]>([{ id: "date", desc: true }]);
