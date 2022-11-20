import React, { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Layout from "../components/Layout";

const LoginPage = () => {
  const [isDisabled, setIsDisabled] = useState(false);

  interface CredentialsInputs {
    username: string;
    password: string;
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialsInputs>();

  const onSubmit: SubmitHandler<CredentialsInputs> = (data) => {
    setIsDisabled(true);
    signIn("credentials", { username: data.username, password: data.password, callbackUrl: "/" });
  };

  return (
    <Layout>
      <div className="flex w-full grow flex-col items-center justify-center gap-8 lg:flex-row lg:gap-16">
        <section className="flex flex-col items-center">
          <Image src="/logo.svg" alt="Logo" width={"100"} height={"100"} priority={true} />
          <h1 className="text-4xl font-bold">Login to</h1>
          <h1 className="text-5xl font-extralight">budgetor</h1>
        </section>
        <section className="flex w-96 flex-col items-center gap-4 rounded-2xl bg-slate-700 p-6 font-medium shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-8">
            <p className="text-center text-2xl">Log in with password</p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <input
                  type="text"
                  placeholder="Username"
                  {...register("username", { required: { value: true, message: "Please fill username..." } })}
                  className={`p-2 ${errors.username && "border border-red-500"}`}
                />
                {errors.username && errors.username.message}
              </div>
              <div className="flex flex-col">
                <input
                  type="password"
                  placeholder="Password"
                  {...register("password", { required: { value: true, message: "Please fill password..." } })}
                  className={`p-2 ${errors.password && "border border-red-500"}`}
                />
                {errors.password && errors.password.message}
              </div>
            </div>
            <button
              type="submit"
              disabled={isDisabled}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-300 fill-stone-800 py-2 px-4 text-xl font-semibold text-stone-800 shadow-xl transition-colors duration-300 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-20"
            >
              <p>Log in</p>
              {isDisabled && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-spin" viewBox="0 0 24 24" stroke="currentColor" fill="currentColor">
                  <path d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z" />
                </svg>
              )}
            </button>
          </form>
        </section>
      </div>
    </Layout>
  );
};

export default LoginPage;
