"use client";

import Link from "next/link";
import {
  Rocket,
  LayoutDashboard,
  Upload,
  Users,
  UserCircle,
  FileText,
  Box,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface SidebarProps {
  isCollapsed?: boolean;
}

const menuItems = [
  { title: "ADOCS", icon: Rocket, href: "/" },
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Upload", icon: Upload, href: "/upload" },
  { title: "Containers", icon: Box, href: "/containers" },
  { title: "Users Manage", icon: Users, href: "/users-manage" },
  { title: "Profile", icon: UserCircle, href: "/profile" },
  { title: "Logs", icon: FileText, href: "/logs" },
];

const Sidebar = ({ isCollapsed = false }: SidebarProps) => {
  const pathName = usePathname();
  const isActive = (path: string) => {
    if (path === pathName && isCollapsed === false) {
      return "text-white bg-sky-400 dark:text-white dark:bg-cyan-500 border-sky-400 dark:border-cyan-500";
    } else if (path !== pathName && isCollapsed === false) {
      return "hover:bg-sky-500/10 dark:hover:bg-white/5  hover:border-sky-500/10 dark:hover:border-cyan-300/10 ";
    }
  };
  const isActiveIcon = (path: string) => {
    if (path === pathName && isCollapsed === true) {
      return "text-white dark:text-white bg-sky-500 dark:bg-cyan-500";
    } else {
      return "border hover:bg-sky-500/10 hover:border-0 hover:text-sky-500 dark:hover:text-cyan-300 dark:hover:bg-cyan-700/20";
    }
  };
  const isActiveText = (path: string, params: string) => {
    if (path === pathName && params === "open" && isCollapsed === false) {
      return "group-hover:text-white dark:group-hover:text-white";
    } else {
      return "group-hover:text-sky-500 dark:group-hover:text-cyan-300";
    }
  };
  return (
    <div className="flex flex-col w-full h-full dark:bg-[oklch(0.2_0_0)] text-gray-800 dark:text-gray-200 py-3 xl:py-3 px-3">
      <div className={"flex flex-col gap-5 px-4 md:px-0"}>
        {menuItems.map((value, index) => {
          const IconComponent = value.icon;
          if (value.title == "ADOCS") {
            return (
              <Link
                href={value.href}
                key={index}
                className={`flex xl:h-30 px-4 md:px-7 rounded-xl justify-center items-center group mb-5 xl:mb-0`}
              >
                <div
                  className={`shrink-0 transition duration-300 ${isCollapsed ? ` w-15 h-15 rounded-xl flex justify-center items-center bg-[linear-gradient(to_right,#14b8a6,#06b6d4,#0ea5e9,#3b82f6,#6366f1,#8b5cf6,#a855f7,#d946ef,#a855f7,#8b5cf6,#6366f1,#3b82f6,#0ea5e9,#06b6d4,#14b8a6)] text-white animate-rgb-box group-hover:scale-110` : "group-hover:scale-110 w-15 h-15 rounded-xl flex justify-center items-center bg-[linear-gradient(to_right,#14b8a6,#06b6d4,#0ea5e9,#3b82f6,#6366f1,#8b5cf6,#a855f7,#d946ef,#a855f7,#8b5cf6,#6366f1,#3b82f6,#0ea5e9,#06b6d4,#14b8a6)] text-white animate-rgb-box group-hover:scale-110"}`}
                >
                  <IconComponent size={35} />
                </div>
                <p
                  className={
                    isCollapsed
                      ? "opacity-0 transition duration-200 w-0"
                      : "truncate w-full opacitiy-100 transition duration-200 pl-3 text-3xl font-[700] group-hover:text-sky-500 dark:group-hover:text-cyan-300"
                  }
                >
                  {value.title}
                </p>
              </Link>
            );
          } else if (value.title !== "ADOCS" && isCollapsed) {
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link
                    href={value.href}
                    className={`flex py-4 px-7 rounded-xl justify-center items-center  ${isActive(value.href)} transition duration-200`}
                  >
                    <div
                      className={`shrink-0 transition duration-200 ${isCollapsed ? `w-15 h-15 rounded-xl flex justify-center items-center ${isActiveIcon(value.href)} hover:scale-110` : `${isActiveText(value.href, "open")} hover:scale-110`}`}
                    >
                      <IconComponent size={26} />
                    </div>
                    <p
                      className={
                        isCollapsed
                          ? "opacity-0 transition duration-200 w-0"
                          : `truncate w-full opacitiy-100 transition duration-200 pl-3 ${isActiveText(value.href, "open")}`
                      }
                    >
                      {value.title}
                    </p>
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side={"right"} className="py-3 px-2">
                    <p>{value.title}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          } else {
            return (
              <Link
                href={value.href}
                key={index}
                className={`flex py-4 px-7 rounded-xl justify-center items-center group ${isActive(value.href)} transition duration-200`}
              >
                <div
                  className={`shrink-0  transition duration-200 ${isCollapsed ? `w-15 h-15 rounded-xl flex justify-center items-center ${isActiveIcon(value.href)} group-hover:scale-110` : `${isActiveText(value.href, "open")} group-hover:scale-110`}`}
                >
                  <IconComponent size={26} />
                </div>
                <p
                  className={
                    isCollapsed
                      ? "opacity-0 transition duration-200 w-0"
                      : `truncate w-full opacitiy-100 transition duration-200 pl-3 ${isActiveText(value.href, "open")}`
                  }
                >
                  {value.title}
                </p>
              </Link>
            );
          }
        })}
      </div>
    </div>
  );
};

export default Sidebar;
