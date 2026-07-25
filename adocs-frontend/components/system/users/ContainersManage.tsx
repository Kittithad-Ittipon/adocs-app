"use client";

import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BsThreeDots } from "react-icons/bs";
import { CircleX, Trash2Icon } from "lucide-react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IoMdSettings } from "react-icons/io";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { pollCeleryTask } from "@/lib/task-check";

type containersData = {
  containerName: string;
  protocol: string;
  domain: string;
  port: string;
  publish: boolean;
  status: string;
  projectPath: string;
};

const ComponentContainersManage = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedContainers, setSelectedContainers] =
    useState<containersData | null>(null);
  const [port, setPort] = useState<string>("");
  const [protocol, setProtocol] = useState<string>("");
  const [publish, setPublish] = useState<boolean>(false);
  const [reFresh, setReFresh] = useState<number>(0);
  const [containersData, setContainersData] = useState<containersData[]>([]);
  useEffect(() => {
    const fetchContainersData = async () => {
      const toastID = "toast-containers-data";
      try {
        const res = await fetch("/api/containers", {
          method: "GET",
          cache: "no-store",
        });
        if (!res.ok) {
          if (containersData.length == 0) {
            return;
          }
          toast.error("Error Fetch Data", {
            description: "Failed to load",
            id: toastID,
          });
          return;
        }
        const data = await res.json();
        setContainersData(data);
      } catch (error) {
        toast.error("Error Fetch Data", {
          description: "Server error 500",
          id: toastID,
        });
      }
    };
    fetchContainersData();
  }, [reFresh]);
  const toEditContainers = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const toastID = toast.loading("Loading...");
    const containerName = selectedContainers?.containerName;
    try {
      const res = await fetch(`/api/containers/${containerName}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          port: String(port),
          containerName,
          protocol,
          publish: Boolean(publish),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Error", { id: toastID, description: data.error });
        return;
      }
      toast.success("Update Successfuly", {
        id: toastID,
        description: data.message,
      });
      setIsOpen(false);
    } catch (error) {
      toast.dismiss(toastID);
      toast.error("Error", { description: "Server Error 500" });
    }
    setReFresh(Date.now());
  };
  const toControlContainers = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    const toastID = toast.loading("Loading...");
    const projectPath = selectedContainers?.projectPath;
    const containerStatus = selectedContainers?.status;
    const selectedContainerName = selectedContainers?.containerName;
    try {
      const res = await fetch(`/api/containers/${selectedContainerName}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectPath, containerStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Error", { id: toastID, description: data.error });
        return;
      }
      if (containerStatus === "running") {
        toast.info("Stopping Containers", {
          id: toastID,
          description: data.message,
        });
        setReFresh(Date.now());
        setIsOpen(false);
        const isSuccess = await pollCeleryTask(
          data.taskID,
          `Start '${selectedContainers?.containerName}' Successfully`,
          `Start '${selectedContainers?.containerName}' Failed `,
        );
        if (isSuccess) {
          setSelectedContainers(null);
          setReFresh(Date.now());
        }
        return;
      } else {
        toast.info("Starting Containers", {
          id: toastID,
          description: data.message,
        });
        setReFresh(Date.now());
        setIsOpen(false);
        const isSuccess = await pollCeleryTask(
          data.taskID,
          `Start '${selectedContainers?.containerName}' Successfully`,
          `Start '${selectedContainers?.containerName}' Failed `,
        );
        if (isSuccess) {
          setSelectedContainers(null);
          setReFresh(Date.now());
        }
        return;
      }
    } catch (error) {
      toast.dismiss(toastID);
      toast.error("Error", { description: "Server Error 500" });
    }
  };
  const toDeleteStack = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const toastID = toast.loading("Loading...");
    const projectPath = selectedContainers?.projectPath;
    const selectedContainerName = selectedContainers?.containerName;
    try {
      const res = await fetch(`/api/containers/${selectedContainerName}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectPath }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Error", { id: toastID, description: data.error });
        return;
      }
      toast.info("Deleting Containers", {
        id: toastID,
        description: data.message,
      });
      setIsOpen(false);
      setReFresh(Date.now());
      const isSuccess = await pollCeleryTask(
        data.taskID,
        `Delete '${selectedContainers?.containerName}' Successfully`,
        `Delete '${selectedContainers?.containerName}' Failed `,
      );
      if (isSuccess) {
        setContainersData([]);
        setSelectedContainers(null);
        setReFresh(Date.now());
      }
    } catch (error) {
      toast.dismiss(toastID);
      toast.error("Error", { description: "Server Error 500" });
    }
  };
  return (
    <div className="max-w-screen min-h-full flex items-center justify-start flex-col">
      <Breadcrumb className="h-full w-full justify-center items-center mt-10 md:mt-2 md:px-9 md:py-5">
        <BreadcrumbList className="w-full h-full text-md xl:text-lg font-[600] justify-center mb-4 sm:mb-0 sm:justify-start items-center">
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-gray-400">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-[600]">
              Containers Manage
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid grid-cols-1 w-full p-4 md:px-8">
        <div
          className={`rounded-xl overflow-hidden w-full overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-all duration-400 ${isOpen ? "max-h-[0px]" : "border max-h-[700px]"}`}
        >
          <Table className="w-full">
            <TableHeader className="bg-muted/50">
              <TableRow className="text-sm text-muted-foreground">
                <TableHead className="font-semibold px-6 h-12">NO.</TableHead>
                <TableHead className="font-semibold px-6 h-12">
                  PROTOCOL
                </TableHead>
                <TableHead className="font-semibold h-12 py-5">
                  DOMAIN
                </TableHead>
                <TableHead className="font-semibold h-12">PORT</TableHead>
                <TableHead className="font-semibold h-12">
                  PROJECT PATH
                </TableHead>
                <TableHead className="font-semibold h-12 text-center">
                  PUBLISH
                </TableHead>
                <TableHead className="font-semibold h-12 text-center">
                  STATUS
                </TableHead>
                <TableHead className="font-semibold h-12">EDIT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {containersData.map((value, index) => (
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
                      className="max-w-[150px] truncate font-[400]"
                      title={value.protocol}
                    >
                      {value.protocol}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div
                      className="max-w-[150px] truncate font-[400]"
                      title={value.domain}
                    >
                      {value.domain}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div
                      className="max-w-[200px] truncate font-[400]"
                      title={value.port}
                    >
                      {value.port}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div
                      className="max-w-[200px] truncate font-[400]"
                      title={value.projectPath}
                    >
                      {value.projectPath}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <span
                      className={`px-2.5 py-1 ${value.publish ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"} rounded-md text-xs font-medium max-w-[150px] truncate inline-block transition duration-200`}
                    >
                      {value.publish ? "YES" : "NO"}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        value.status == "running"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : value.status == "pending"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {value.status == "running"
                        ? "Runnung"
                        : value.status == "pending"
                          ? "Pending"
                          : "Stoped"}
                    </span>
                  </TableCell>
                  <TableCell className="flex items-center justify-start">
                    <button
                      onClick={() => {
                        setIsOpen(true);
                        setSelectedContainers(value);
                        setPort(value.port);
                        setProtocol(value.protocol);
                        setPublish(value.publish);
                      }}
                      className="flex justify-start items-center text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors h-full"
                    >
                      <BsThreeDots size={30} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {containersData.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={8}
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
          className={`relative w-full mt-4 rounded-xl overflow-hidden transition-all flex justify-center duration-400 ${isOpen ? "h-[850px] md:h-[700px] border" : "h-[0px]"}`}
        >
          <div className="w-full h-full overflow-y-auto scrollbar-hide px-12 py-11 flex flex-col justify-between [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => {
                setIsOpen(false);
                setSelectedContainers(null);
              }}
              className="absolute top-4 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-50 cursor-pointer transition-colors"
            >
              <CircleX />
            </button>
            <div className="text-xl mb-4 md:0 font-[700] flex gap-3 items-center">
              <IoMdSettings size={30} />
              {selectedContainers?.domain}
            </div>
            <div className="grid grid-cols-1 w-full md:gap-8">
              <Field className="mb-4 md:mb-0">
                <FieldLabel htmlFor="input-deployment-action">
                  Protocol
                </FieldLabel>
                <div className="relative w-full">
                  <Select
                    value={protocol ? protocol.toLowerCase() : undefined}
                    onValueChange={(value) => setProtocol(value)}
                  >
                    <SelectTrigger
                      className="w-full !h-15 shadow-none"
                      id="input-deployment-action"
                    >
                      <SelectValue placeholder="Choose an option" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                      <SelectGroup>
                        <SelectLabel>Protocol Type</SelectLabel>
                        <SelectItem value="http">HTTP</SelectItem>
                        <SelectItem value="https">HTTPS</SelectItem>{" "}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <FieldDescription className="flex items-start justify-start gap-2">
                  The internal protocol your app uses (e.g., HTTP for 80). Match
                  this if domain access fails.
                </FieldDescription>
              </Field>
              <Field className="mb-4 md:mb-0">
                <FieldLabel htmlFor="input-port">Port</FieldLabel>
                <Input
                  id="input-port"
                  type="text"
                  className="h-15 shadow-none"
                  placeholder="Enter Port Number"
                  value={port}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPort(e.target.value);
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === " ") {
                      e.preventDefault();
                    }
                  }}
                />
                <FieldDescription>
                  The internal port your service listens on (e.g., 3000 for
                  Node.js, 80 for Nginx).
                </FieldDescription>
              </Field>
              <FieldGroup className="w-full mb-4 md:mb-0">
                <FieldLabel
                  htmlFor="switch-db"
                  className="!min-h-15 shadow-none cursor-pointer"
                >
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>Publish Container</FieldTitle>
                      <FieldDescription>
                        Expose this container to the local area network.
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      key={selectedContainers?.domain}
                      id="switch-db"
                      defaultChecked={publish}
                      onCheckedChange={(checked) =>
                        setPublish(checked as boolean)
                      }
                      className="cursor-pointer"
                    />
                  </Field>
                </FieldLabel>
              </FieldGroup>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-2 md:gap-4">
              <div className="w-full">
                <Button
                  onClick={toEditContainers}
                  className="shadow-none h-10 w-full md:h-13 bg-black/85 dark:bg-white dark:hover:bg-white/80 cursor-pointer"
                >
                  Save Change
                </Button>
              </div>
              <div className="w-full">
                {selectedContainers?.status == "running" && (
                  <Button
                    onClick={toControlContainers}
                    className="shadow-none h-10 w-full md:h-13 cursor-pointer bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-700 transition-colors"
                  >
                    Stop
                  </Button>
                )}
                {selectedContainers?.status == "stopped" && (
                  <Button
                    onClick={toControlContainers}
                    className="shadow-none h-10 w-full md:h-13 cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors"
                  >
                    Start
                  </Button>
                )}
                {selectedContainers?.status == "pending" && (
                  <Button
                    onClick={(e) => {
                      toast.warning("Status Pending");
                    }}
                    className="shadow-none h-10 w-full md:h-13 cursor-pointer bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
                  >
                    Pending
                  </Button>
                )}
              </div>
              <div className="w-full">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full shadow-none font-[500] bg-red-500 text-white hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-700 h-10 md:h-13 cursor-pointer"
                    >
                      Delete Container
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm" className="!max-w-[500px]">
                    <AlertDialogHeader>
                      <AlertDialogMedia className="dark:bg-red-500 bg-red-100 text-red-600 dark:text-white">
                        <Trash2Icon />
                      </AlertDialogMedia>
                      <AlertDialogTitle className="font-[700]">
                        Delete Entire Stack?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="flex flex-col gap-3 text-left mt-2">
                        <span>
                          Are you sure you want to delete this container? This
                          action is permanent and will permanently delete{" "}
                          <strong>ALL containers</strong> running in the same
                          stack.
                        </span>
                        <span className="p-3 bg-red-50 dark:bg-red-500 rounded-lg border border-red-100 dark:border-red-900/50 flex flex-col gap-1 text-slate-800 dark:text-slate-200 text-sm">
                          <span className="max-w-[300px] truncate">
                            <strong>Domain</strong> {selectedContainers?.domain}
                          </span>
                        </span>
                        <span>
                          All associated resources, including mapped data,
                          networks, and configurations for this entire stack
                          will be wiped from the server.
                        </span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                      <AlertDialogCancel
                        variant="outline"
                        className="!shadow-none"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        className="shadow-none dark:bg-red-500 dark:hover:bg-red-700 dark:text-white"
                        onClick={toDeleteStack}
                      >
                        Yes, delete stack
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ComponentContainersManage;
