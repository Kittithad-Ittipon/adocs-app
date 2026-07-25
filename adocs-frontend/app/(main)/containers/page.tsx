"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpRight,
  Box,
  Clock,
  FileBox,
  Search,
  TableOfContents,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { IoGrid } from "react-icons/io5";
import { toast } from "sonner";

type containersItem = {
  containerName: string;
  domain: string;
  image: string;
  owner: string;
  upDateTime: string;
  status: string;
};

const Containers = () => {
  const [allData, setAllData] = useState<containersItem[]>([]);
  const [isViewerMode, setIsViewerMode] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchContainersData = async () => {
      try {
        const res = await fetch("/api/containers/active", { method: "GET" });
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
    fetchContainersData();
  }, []);

  const toSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value.toLocaleLowerCase());
  };
  const toChangeViewerMode = (state: boolean) => {
    if (isViewerMode !== state) {
      setIsViewerMode(state);
      return;
    }
    toast.info("Already in this mode", {
      description: state
        ? "You are already using Card View"
        : "You are already using Table View",
    });
    return;
  };

  const filteredData = allData.filter((item) => {
    if (!searchText) {
      return true;
    }
    return (
      item.owner.toLowerCase().includes(searchText) ||
      item.domain.toLowerCase().includes(searchText)
    );
  });

  return (
    <main className="w-full min-h-screen flex items-center justify-start flex-col">
      <div className="w-[95%] xl:w-[80%] flex flex-col items-center justify-start">
        <div className="grid grid-cols-1 xl:grid-cols-2 w-full h-25 items-center pt-2 xl:px-4">
          <div className="w-full h-full flex items-center justify-start pb-4">
            <Breadcrumb className="h-full w-full justify-center items-center">
              <BreadcrumbList className="w-full h-full text-md xl:text-lg font-[600] justify-center mb-4 sm:mb-0 sm:justify-start items-center">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="text-gray-400">
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-[600]">
                    Containers
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="h-15 flex items-center justify-between xl:justify-end xl:gap-4 relative w-full">
            <div className="h-15 flex items-center justify-between xl:justify-end relative w-[60%] xl:w-full">
              <Input
                placeholder="Owner or Domain"
                className="h-15 w-full shadow-none rounded-xl pl-5 pr-15 truncate"
                type="text"
                onChange={toSearch}
              ></Input>
              <Search className="absolute right-4" />
            </div>
            <div className="flex bg-gray-200 dark:bg-zinc-900 p-1 h-full rounded-xl items-center border border dark:border-zinc-800 shrink-0">
              <button
                onClick={() => toChangeViewerMode(true)}
                className={`flex items-center justify-center w-14 h-full rounded-lg transition-all duration-200 ${
                  isViewerMode
                    ? "bg-white dark:bg-zinc-800 text-sky-500 dark:text-cyan-400 font-bold"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <IoGrid className="size-6" />
              </button>
              <button
                onClick={() => toChangeViewerMode(false)}
                className={`flex items-center justify-center w-14 h-full rounded-lg transition-all duration-200 ${
                  !isViewerMode
                    ? "bg-white dark:bg-zinc-800 text-sky-500 dark:text-cyan-400 font-bold"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <TableOfContents className="size-6" />
              </button>
            </div>
          </div>
        </div>
        {isViewerMode === false && (
          <div className="w-full mt-4 xl:px-4 mb-10 mt-10 h-full">
            <div className="border rounded-xl overflow-hidden h-full xl:h-[70vh] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="text-sm text-muted-foreground">
                    <TableHead className="font-semibold px-6 h-12">
                      CONTAINER NAME
                    </TableHead>
                    <TableHead className="font-semibold h-12 py-5">
                      DOMAIN
                    </TableHead>
                    <TableHead className="font-semibold h-12">IMAGE</TableHead>
                    <TableHead className="font-semibold h-12">OWNER</TableHead>
                    <TableHead className="font-semibold h-12">UPDATE</TableHead>
                    <TableHead className="font-semibold h-12 text-center">
                      STATUS
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((value, index) => (
                    <TableRow
                      key={index}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <TableCell className="px-6 py-4">
                        <div
                          className="max-w-[200px] truncate font-medium"
                          title={value.containerName}
                        >
                          {value.containerName}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <a
                          href={`https://${value.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 group text-foreground hover:text-sky-500 dark:hover:text-cyan-300 transition-colors"
                        >
                          <span className="max-w-[150px] truncate">
                            {value.domain}
                          </span>
                          <ArrowUpRight
                            size={14}
                            className="opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
                          />
                        </a>
                      </TableCell>
                      <TableCell className="py-4">
                        <span
                          className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium max-w-[120px] truncate inline-block"
                          title={value.image}
                        >
                          {value.image}
                        </span>
                      </TableCell>
                      <TableCell
                        className="py-4 max-w-[150px] truncate"
                        title={value.owner}
                      >
                        {value.owner}
                      </TableCell>
                      <TableCell
                        className="py-4 text-muted-foreground text-sm max-w-[150px] truncate"
                        title={value.upDateTime}
                      >
                        {value.upDateTime}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            value.status === "running"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {value.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredData.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={6}
                        className="py-5 text-center text-muted-foreground font-medium"
                      >
                        No Results Found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        {isViewerMode === true && (
          <div className="w-full mt-4 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 xl:px-4 mb-10 mt-10 h-full xl:max-h-[70vh] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {filteredData.map((value, index) => (
              <div
                key={index}
                className="text-card-foreground border rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md hover:border-sky-500/40 dark:hover:border-cyan-400/40 transition-all duration-300 group"
              >
                <div className="flex justify-between items-start gap-3">
                  <a
                    href={`https://${value.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 group/link text-lg font-semibold hover:text-sky-500 dark:hover:text-cyan-400 transition-colors overflow-hidden"
                  >
                    <span className="truncate" title={value.domain}>
                      {value.domain}
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="shrink-0 opacity-50 group-hover/link:opacity-100 group-hover/link:-translate-y-0.5 transition-all"
                    />
                  </a>
                  <span
                    className={`shrink-0 inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      value.status === "running"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {value.status}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5 mt-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Box className="size-4 text-muted-foreground shrink-0" />
                    <span
                      className="truncate text-muted-foreground"
                      title={value.containerName}
                    >
                      <span className="font-[400] mr-1">
                        {value.containerName}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="size-4 text-muted-foreground shrink-0" />
                    <span
                      className="truncate text-muted-foreground"
                      title={value.owner}
                    >
                      <span className="font-[400] mr-1">{value.owner}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <FileBox className="size-4 text-muted-foreground shrink-0" />
                    <span
                      className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs font-medium truncate"
                      title={value.image}
                    >
                      {value.image}
                    </span>
                  </div>
                </div>
                <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-muted-foreground border-t border-border/50">
                  <Clock className="size-3.5 shrink-0" />
                  <span className="truncate" title={value.upDateTime}>
                    {value.upDateTime}
                  </span>
                </div>
              </div>
            ))}
            {filteredData.length === 0 && (
              <div className="bg-card text-card-foreground border rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md hover:border-sky-500/40 dark:hover:border-cyan-400/40 transition-all duration-300 group">
                <div className="flex justify-between items-start gap-3">
                  <a
                    href="#"
                    className="flex items-center gap-1 group/link text-lg font-semibold hover:text-sky-500 dark:hover:text-cyan-400 transition-colors overflow-hidden"
                  >
                    <span className="truncate">No Results Found</span>
                    <ArrowUpRight
                      size={18}
                      className="shrink-0 opacity-50 group-hover/link:opacity-100 group-hover/link:-translate-y-0.5 transition-all"
                    />
                  </a>
                </div>
                <div className="flex flex-col gap-2.5 mt-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Box className="size-4 text-muted-foreground shrink-0" />
                    <span className="truncate text-muted-foreground">
                      <span className="font-[400] mr-1">No Results Found</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="size-4 text-muted-foreground shrink-0" />
                    <span className="truncate text-muted-foreground">
                      <span className="font-[400] mr-1">No Results Found</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <FileBox className="size-4 text-muted-foreground shrink-0" />
                    <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs font-medium truncate">
                      No Results Found
                    </span>
                  </div>
                </div>
                <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-muted-foreground border-t border-border/50">
                  <Clock className="size-3.5 shrink-0" />
                  <span className="truncate">No Results Found</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};
export default Containers;
