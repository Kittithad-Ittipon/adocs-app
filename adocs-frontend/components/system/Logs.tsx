"use client";

import { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { BsTerminal } from "react-icons/bs";
import { CircleX, PaintBucket } from "lucide-react";
import { toast } from "sonner";

type logsItem = {
  username: string;
  containers: string;
  action: string;
  upDateTime: string;
  status: string;
  details: string;
};

const ComponentLogs = () => {
  const [allData, setAllData] = useState<logsItem[]>([]);
  const [selectedLog, setSelectedLog] = useState<logsItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isChange, setIsChange] = useState<string>("text-sky-500");

  useEffect(() => {
    const fetchLogsData = async () => {
      const toastID = "toast-logs";
      try {
        const res = await fetch("/api/logs", { method: "GET" });
        if (!res.ok) {
          if (allData.length == 0) {
            return;
          }
          toast.error("Error Fetch Data", {
            description: "Failed to load",
            id: toastID,
          });
          return;
        }
        const data = await res.json();
        setAllData(data);
      } catch (error) {
        toast.error("Error Fetch Data", {
          description: "Server error 500",
          id: toastID,
        });
      }
    };
    fetchLogsData();
  }, []);

  return (
    <div className="max-w-screen min-h-full flex items-center justify-start flex-col">
      <Breadcrumb className="h-full w-full justify-center items-center mt-10 md:mt-2 md:px-9 md:py-5">
        <BreadcrumbList className="w-full h-full text-md xl:text-lg font-[600] justify-center mb-4 sm:mb-0 md:justify-start items-center">
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-gray-400">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-[600]">Logs</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid grid-cols-1 w-full p-4 md:px-8">
        <div
          className={`border rounded-xl overflow-hidden w-full overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-all duration-400 ${isOpen ? "max-h-[300px]" : "max-h-[700px]"}`}
        >
          <Table className="w-full">
            <TableHeader className="bg-muted/50">
              <TableRow className="text-sm text-muted-foreground">
                <TableHead className="font-semibold px-6 h-12">NO.</TableHead>
                <TableHead className="font-semibold px-6 h-12">
                  USERNAME
                </TableHead>
                <TableHead className="font-semibold h-12 py-5">
                  CONTAINER
                </TableHead>
                <TableHead className="font-semibold h-12">ACTION</TableHead>
                <TableHead className="font-semibold h-12">UPDATE</TableHead>
                <TableHead className="font-semibold h-12 text-center">
                  STATUS
                </TableHead>
                <TableHead className="font-semibold h-12">DETAILS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allData.map((value, index) => (
                <TableRow
                  key={index}
                  className="transition-colors hover:bg-muted/40"
                >
                  <TableCell className="px-6 py-4">
                    <div className="max-w-[200px] truncate font-medium">
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div
                      className="max-w-[200px] truncate font-[400]"
                      title={value.username}
                    >
                      {value.username}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div
                      className="max-w-[200px] truncate font-[400]"
                      title={value.containers}
                    >
                      {value.containers}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span
                      className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium max-w-[150px] truncate inline-block"
                      title={value.action}
                    >
                      {value.action}
                    </span>
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
                        value.status === "SUCCESS"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {value.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 flex items-center justify-start">
                    <button
                      onClick={() => {
                        setSelectedLog(value);
                        setIsOpen(true);
                      }}
                      className="flex justify-start items-center pl-4 text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      <BsTerminal size={25} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {allData.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={7}
                    className="py-5 text-center text-muted-foreground font-medium"
                  >
                    No Results Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div
          className={`relative w-full mt-4 rounded-xl overflow-hidden bg-black transition-all duration-400 ${isOpen ? "h-[400px]" : "h-[0px]"}`}
        >
          <button
            onClick={() => {
              setSelectedLog(null);
              setIsOpen(false);
            }}
            className="absolute top-4 right-5 text-gray-400 hover:text-gray-200 z-20 cursor-pointer transition-colors"
          >
            <CircleX />
          </button>
          <button
            onClick={() => {
              setIsChange("text-sky-500");
            }}
            className="absolute top-4 right-15 text-sky-400 hover:text-sky-700 z-20 cursor-pointer transition-colors"
          >
            <PaintBucket />
          </button>
          <button
            onClick={() => {
              setIsChange("text-gray-300");
            }}
            className="absolute top-4 right-25 text-gray-300 hover:text-gray-500 z-20 cursor-pointer transition-colors"
          >
            <PaintBucket />
          </button>
          <button
            onClick={() => {
              setIsChange("text-green-500");
            }}
            className="absolute top-4 right-35 text-green-400 hover:text-green-700 z-20 cursor-pointer transition-colors"
          >
            <PaintBucket />
          </button>
          <div className="w-full h-full overflow-y-auto scrollbar-hide px-12 md:py-11 py-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] text-[12px] md:text-[17px]">
            <div
              className={`whitespace-pre-wrap font-mono ${isChange} transition-colors duration-200`}
            >
              {selectedLog?.details}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ComponentLogs;
