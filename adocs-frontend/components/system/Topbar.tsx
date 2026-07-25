"use client";

import { ChevronDown, LogOut, Mail, User, UserCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type usersData = {
  username: string;
  email: string;
  db: boolean;
  container: string;
  maxContainers: string;
  role: string;
  userUploadTotal: number;
};

const Topbar = () => {
  const rounter = useRouter();
  const [allData, setAllData] = useState<usersData>({
    username: "Loading...",
    email: "Loading...",
    db: false,
    container: "1",
    maxContainers: "1",
    role: "Loading...",
    userUploadTotal: 0,
  });
  const toLogOut = async () => {
    await fetch("/api/auth/logout", { method: "DELETE" });
    rounter.refresh();
    rounter.replace("/");
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/users/profile", { method: "GET" });
        if (!res.ok) {
          toast.error("Error Fetch Data", {
            description: "Failed to load",
          });
          return;
        }
        const data = await res.json();
        setAllData(data);
      } catch (error) {
        toast.error("Error Fetch Data", {
          description: "Server error 500",
        });
      }
    };
    fetchUserData();
  }, []);
  return (
    <div className="flex gap-4 items-center text-gray-800 dark:text-gray-200">
      <Popover>
        <PopoverTrigger asChild>
          <button className="cursor-pointer group flex items-center gap-3 w-full max-w-[300px] p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <div className="shrink-0 flex justify-center items-center w-12 h-12 rounded-full bg-[linear-gradient(to_right,#14b8a6,#06b6d4,#0ea5e9,#3b82f6,#6366f1,#8b5cf6,#a855f7,#d946ef,#a855f7,#8b5cf6,#6366f1,#3b82f6,#0ea5e9,#06b6d4,#14b8a6)] animate-rgb-box text-white">
              <User size={26} />
            </div>
            <div className="flex-1 text-left min-w-0 font-[600] text-md truncate">
              <div>
                {allData.username.charAt(0).toUpperCase() +
                  allData.username.slice(1)}
              </div>
              <div className="text-xs font-[300]">{allData.role}</div>
            </div>
            <ChevronDown className="shrink-0 w-5 h-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-60 p-2 rounded-xl border border-gray-100 dark:border-gray-800 shadow-none"
          side="bottom"
          align="end"
        >
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-3 px-2 py-2">
              <div className="text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-500">
                Information
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-3 text-sm text-gray-800 dark:text-gray-200">
                  <User className="w-4 h-4 text-gray-500 shrink-0" />
                  <span
                    className="truncate max-w-[140px]"
                    title={allData.username}
                  >
                    {allData.username.charAt(0).toUpperCase() +
                      allData.username.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-800 dark:text-gray-200">
                  <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                  <span
                    className="truncate max-w-[140px]"
                    title={allData.email}
                  >
                    {allData.email}
                  </span>
                </div>
              </div>
            </div>
            <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-1" />
            <div className="flex flex-col gap-0.5">
              <Link
                href={allData.username == "admin" ? "/profile" : "/users/profile"}
                className="flex items-center gap-3 px-2 py-2.5 text-sm font-[500] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left w-full cursor-pointer"
              >
                <UserCircle className="w-4 h-4 text-gray-500 shrink-0" />
                <span>My Profile</span>
              </Link>
              <button
                onClick={toLogOut}
                className="flex items-center gap-3 px-2 py-2.5 text-sm font-[600] rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left w-full cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Topbar;
