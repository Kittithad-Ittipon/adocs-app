"use client";

import { Eye, EyeOff, LockKeyhole, ShieldUser } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "../ThemeToggle";
import { Input } from "../ui/input";
import React, { useState } from "react";
import { toast } from "sonner";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const CheckStateText = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPassword((prev) => !prev);
  };
  const toLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const toastID = toast.loading("Loading...");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Error", { id: toastID, description: data.error });
        return;
      }
      toast.success("Login Success", {
        id: toastID,
        description: data.message,
      });
      window.location.href = data.href;
    } catch (error) {
      toast.dismiss(toastID);
      toast.error("Error", { description: "Server Error 500" });
    }
  };
  return (
    <div className="relative w-[95%] sm:max-w-[500px] md:max-w-[576px] min-h-180 md:border rounded-xl p-2 flex flex-col justify-between items-center">
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>
      <div className="w-1/2 px-8 flex justify-center items-center">
        <Link
          href={"/"}
          className="relative w-full text-4xl flex font-[700] justify-center items-center py-3 pt-10 gap-5 cursor-pointer transition duration-300 group"
        >
          <p className="bg-[linear-gradient(to_right,#0ea5e9,#67e8f9,#818cf8,#0ea5e9)] bg-clip-text text-transparent animate-rgb">
            ADOCS
          </p>
          <span className="absolute rounded-xl bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-sky-500 to-cyan-300 transform scale-x-0 group-hover:scale-x-100 transition duration-300 origin-left"></span>
        </Link>
      </div>
      <div className="h-[50%] w-full">
        <form
          action="#"
          method="post"
          className="w-full h-full flex flex-col gap-10 md:px-8"
          onSubmit={toLogin}
        >
          <div className="flex flex-col gap-5">
            <div className="flex gap-2 items-center text-xl font-[600]">
              <ShieldUser size={30} /> Username or Email
            </div>
            <div>
              <Input
                placeholder="Enter Your Username or Email"
                id="username"
                type="text"
                className="h-15 shadow-none"
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === " ") {
                    e.preventDefault();
                  }
                }}
              ></Input>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex gap-2 items-center text-xl font-[600]">
              <LockKeyhole size={30} /> Password
            </div>
            <div className="relative">
              <Input
                placeholder="Enter Your Password"
                id="password"
                type={showPassword ? "text" : "password"}
                className="h-15 shadow-none"
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                autoComplete="off"
              ></Input>
              <button
                className="absolute top-5 right-3 cursor-pointer"
                onClick={CheckStateText}
                type="button"
              >
                <Eye className={showPassword ? "hidden" : "flex"} />
                <EyeOff className={showPassword ? "flex" : "hidden"} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center mt-5">
            <button className="w-full p-3 h-auto bg-black/85 text-white text-lg font-[500] rounded-lg cursor-pointer transition duration-200 hover:bg-black/75 dark:text-black dark:bg-white dark:hover:bg-white/85 dark:hover:text-black">
              Login
            </button>
          </div>
        </form>
      </div>
      <div className="mb-13 flex w-full px-8 justify-between flex-col gap-2 items-center pt-2">
        <div>
          Don’t have an account ?{" "}
          <Link
            href={"/register"}
            className="text-sky-500 font-[500] text-sky-500 dark:text-cyan-300 transition duration-200 hover:text-black hover:dark:text-white"
          >
            Register
          </Link>
        </div>
        <div className="font-[500] text-sky-500 dark:text-cyan-300 transition duration-200 hover:text-black hover:dark:text-white">
          <Link href={"/forgot"}>Forgot your password ?</Link>
        </div>
      </div>
    </div>
  );
};
export default LoginForm;
