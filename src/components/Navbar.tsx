import React, { Fragment, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Popover, Transition } from "@headlessui/react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isDisabled, setIsDisabled] = useState(false);

  return (
    <div className="sticky top-0 z-50 w-full bg-slate-700 p-2 font-bold text-slate-50">
      <div className="flex items-center justify-between">
        <div className="flex select-none items-center gap-2">
          <div className="relative h-6 w-6">
            <Image src="/logo.svg" alt="logo" layout="fill" />
          </div>
          <h1 className="text-2xl font-extralight">budgetor</h1>
        </div>

        {session && (
          <Popover className="relative">
            <>
              <Popover.Button
                className="inline-flex items-center gap-2 rounded-md px-3 py-2
                  hover:bg-black hover:bg-opacity-20 hover:text-opacity-100
                  focus:outline-none focus-visible:bg-black focus-visible:bg-opacity-20
                  active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-5 w-5 stroke-slate-50">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
                <span className="font-semibold">Menu</span>
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute right-0 z-10 mt-1 min-w-max">
                  <div className="overflow-hidden rounded-lg bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5">
                    <section className="flex flex-col items-start p-1">
                      <Link
                        href="/"
                        className={`mb-1 flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-slate-600 hover:bg-opacity-25 ${
                          router.pathname === "/" && "bg-slate-700"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                        </svg>
                        <span>Month view</span>
                      </Link>
                      <Link
                        href="/year"
                        className={`mb-1 flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-slate-600 hover:bg-opacity-25 ${
                          router.pathname === "/year" && "bg-slate-700"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                          />
                        </svg>
                        <span>Year view</span>
                      </Link>
                      <Link
                        href="/recurring"
                        className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-slate-600 hover:bg-opacity-25 ${
                          router.pathname === "/recurring" && "bg-slate-700"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
                          />
                        </svg>
                        <span>Recurring transactions</span>
                      </Link>
                    </section>
                    <section className="flex flex-col border-t border-slate-700 p-1">
                      <Link
                        href="/settings"
                        className={`mb-1 flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-slate-600 hover:bg-opacity-25 ${
                          router.pathname === "/settings" && "bg-slate-700"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
                          />
                        </svg>

                        <span>Settings</span>
                      </Link>
                      <button
                        className="group flex w-full items-center gap-2 rounded px-2 py-1.5
                              hover:bg-red-500 hover:bg-opacity-50
                              disabled:cursor-not-allowed disabled:opacity-20"
                        disabled={isDisabled}
                        onClick={() => {
                          setIsDisabled(true);
                          signOut();
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} className="h-5 w-5 stroke-red-500 group-hover:stroke-slate-200">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                        </svg>
                        <span>Logout {session?.user?.name}</span>
                        {isDisabled && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-spin" viewBox="0 0 24 24" stroke="currentColor" fill="currentColor">
                            <path d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z" />
                          </svg>
                        )}
                      </button>
                    </section>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default Navbar;
