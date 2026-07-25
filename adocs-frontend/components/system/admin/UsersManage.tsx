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
import {
  CircleX,
  Mail,
  Server,
  Shield,
  Trash2Icon,
  User,
  UserCog,
  UserPen,
} from "lucide-react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
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
import { date } from "zod";
import { pollCeleryTask } from "@/lib/task-check";

type usersData = {
  username: string;
  email: string;
  role: string;
  container: string;
  maxContainer: string;
  db: boolean;
  requestDB: boolean;
  usersStatus: null;
};

const ComponentUsersManage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<usersData | null>(null);
  const [usersData, setUsersData] = useState<usersData[]>([]);
  const [reFresh, setReFresh] = useState<number>(0);
  const [useDB, setUseDB] = useState<boolean>(false);
  const [maxContainers, setMaxContainers] = useState<string>("");
  useEffect(() => {
    const fetchContainersData = async () => {
      const toastID = "toast-containers-data";
      try {
        const res = await fetch(`/api/users`, { method: "GET" });
        if (!res.ok) {
          if (usersData.length == 0) {
            return;
          }
          toast.error("Error Fetch Data", {
            description: "Failed to load",
            id: toastID,
          });
          return;
        }
        const data = await res.json();
        setUsersData(data);
      } catch (error) {
        toast.error("Error Fetch Data", {
          description: "Server error 500",
          id: toastID,
        });
      }
    };
    fetchContainersData();
  }, [reFresh]);
  const toEditUsers = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const toastID = toast.loading("Loading...");
    const userName = selectedUsers?.username;
    try {
      const res = await fetch(`/api/users/${userName}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxContainers,
          userName,
          useDB: Boolean(useDB),
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
    } catch (error) {
      toast.dismiss(toastID);
      toast.error("Error", { description: "Server Error 500" });
    }
    setReFresh(Date.now());
    setIsOpen(false);
  };
  const toDeleteUser = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const toastID = toast.loading("Loading...");
    const username = selectedUsers?.username;
    try {
      const res = await fetch(`/api/users/${username}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Error", { id: toastID, description: data.error });
        return;
      }
      toast.info("Deleting User", {
        id: toastID,
      });
      setReFresh(Date.now());
      setIsOpen(false);
      const isSuccess = await pollCeleryTask(
        data.taskID,
        `Delete '${selectedUsers?.username}' Successfully`,
        `Delete '${selectedUsers?.username}' Failed `,
      );
      if (isSuccess) {
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
        <BreadcrumbList className="w-full h-full text-md xl:text-lg font-[600] justify-center mb-4 sm:mb-0 md:justify-start items-center">
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-gray-400">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-[600]">Users Manage</BreadcrumbPage>
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
                  USERNAME
                </TableHead>
                <TableHead className="font-semibold h-12 py-5">EMAIL</TableHead>
                <TableHead className="font-semibold h-12">ROLE</TableHead>
                <TableHead className="font-semibold h-12 text-center">
                  CONTAINERS
                </TableHead>
                <TableHead className="font-semibold h-12 text-center">
                  MAX CONTAINERS
                </TableHead>
                <TableHead className="font-semibold h-12">
                  DATABASE STATUS
                </TableHead>
                <TableHead className="font-semibold h-12">EDIT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData.map((value, index) => (
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
                      className={`max-w-[150px] truncate font-[400] ${value.usersStatus === null ? "" : "text-red-500 gap-3"}`}
                      title={value.username}
                    >
                      {value.usersStatus === null ? "" : <span>Deleting</span>}{" "}
                      {value.username}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div
                      className="max-w-[150px] truncate font-[400]"
                      title={value.email}
                    >
                      {value.email}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div
                      className="max-w-[200px] truncate font-[400]"
                      title={value.role}
                    >
                      {value.role}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <span
                      className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium max-w-[150px] truncate inline-block"
                      title={value.container}
                    >
                      {value.container}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <span
                      className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium max-w-[150px] truncate inline-block"
                      title={value.maxContainer}
                    >
                      {value.maxContainer}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        value.db
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : value.requestDB
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {value.db
                        ? "Connected"
                        : value.requestDB
                          ? "Pending Request"
                          : "Not Connected"}
                    </span>
                  </TableCell>
                  <TableCell className="flex items-center justify-start">
                    <button
                      onClick={() => {
                        setIsOpen(true);
                        setSelectedUsers(value);
                        setMaxContainers(value.maxContainer);
                        setUseDB(value.db);
                      }}
                      className="flex justify-start items-center text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      <UserPen size={25} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {usersData.length === 0 && (
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
          className={`relative w-full mt-4 rounded-xl overflow-hidden transition-all flex justify-center duration-400 ${isOpen ? "h-[750px] md:h-[500px]  border" : "h-[0px]"}`}
        >
          <div className="w-full h-full overflow-y-auto scrollbar-hide px-12 py-11 flex flex-col justify-between gap-8 md:gap-0  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => {
                setIsOpen(false);
                setSelectedUsers(null);
              }}
              className="absolute top-4 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-50 cursor-pointer transition-colors"
            >
              <CircleX />
            </button>
            <div className="w-full flex flex-col md:flex-row gap-7">
              <div className="flex items-center gap-3">
                <UserCog size={40} />
                <h3 className="text-xl font-semibold text-foreground">
                  {selectedUsers?.username}
                </h3>
              </div>
              <div className="flex flex-col md:flex-row gap-4 md:gap-7 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <Mail className="text-muted-foreground shrink-0 w-6 h-6 md:w-8 md:h-8" />
                  <span className="truncate">
                    {selectedUsers?.email || "No email"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="text-muted-foreground shrink-0 w-6 h-6 md:w-8 md:h-8" />
                  <span className="uppercase text-[11px] font-bold tracking-wider px-2 py-0.5 bg-primary/10 text-primary rounded-md">
                    {selectedUsers?.role || "USER"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Server className="text-muted-foreground shrink-0 w-6 h-6 md:w-8 md:h-8" />
                  <span>
                    <span className="font-bold text-foreground text-base">
                      {selectedUsers?.container || 0}
                    </span>
                    <span className="text-muted-foreground mx-1.5">/</span>
                    <span className="text-muted-foreground">
                      {selectedUsers?.maxContainer || 0} Containers
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <form
              id="form-edit-users"
              className="min-h-[200px] flex flex-col gap-2 md:gap-10"
            >
              <Field className="mb-4 md:mb-0">
                <FieldLabel htmlFor="input-containers">
                  Max Containers Limit
                </FieldLabel>
                <Input
                  key={selectedUsers?.username}
                  id="input-containers"
                  type="text"
                  className="h-15 shadow-none"
                  placeholder="5 - 10"
                  defaultValue={maxContainers}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setMaxContainers(e.target.value);
                  }}
                />
                <FieldDescription>
                  Define the maximum number of containers this user is allowed
                  to deploy (Allowed range: 5 to 10).
                </FieldDescription>
              </Field>
              <FieldGroup className="w-full mb-4 md:mb-0">
                <FieldLabel
                  htmlFor="switch-db"
                  className="!min-h-15 shadow-none"
                >
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>Enable Database Access</FieldTitle>
                      <FieldDescription>
                        Database authentication requires a Username and
                        Password. The default credentials are{" "}
                        {selectedUsers?.username} and "password"
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      key={selectedUsers?.username}
                      id="switch-db"
                      defaultChecked={useDB}
                      onCheckedChange={(checked) =>
                        setUseDB(checked as boolean)
                      }
                    />
                  </Field>
                </FieldLabel>
              </FieldGroup>
            </form>
            <div className="grid grid-cols1 md:grid-cols-2 items-center gap-2 md:gap-6 mt-6">
              <Button
                onClick={toEditUsers}
                className="shadow-none h-10 md:h-13 bg-black/85 dark:bg-white hover:dark:bg-white/80 cursor-pointer"
              >
                Save Change
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full shadow-none font-[500] bg-red-500 text-white hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-700 h-10 md:h-13 cursor-pointer"
                  >
                    Delete User
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent size="sm" className="!max-w-[500px]">
                  <AlertDialogHeader>
                    <AlertDialogMedia className="dark:bg-red-500 bg-red-100 text-red-600 dark:text-white">
                      <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle className="font-[700]">
                      Delete User Account?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="flex flex-col gap-3 text-left mt-2">
                      <span>
                        Are you sure you want to delete this user? This action
                        is permanent and cannot be undone.
                      </span>
                      <span className="p-3 bg-red-50 dark:bg-red-500 rounded-lg border border-red-100 dark:border-red-900/50 flex flex-col gap-1 text-slate-800 dark:text-slate-200 text-sm">
                        <span className="max-w-[300px] truncate">
                          <strong>Username</strong> {selectedUsers?.username}
                        </span>
                        <span className="max-w-[300px] truncate">
                          <strong>Email</strong> {selectedUsers?.email}
                        </span>
                      </span>
                      <span>
                        All associated resources, including{" "}
                        <strong>Containers</strong>, <strong>Domains</strong>,
                        and database data will be permanently wiped from the
                        server.
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
                      onClick={toDeleteUser}
                    >
                      Yes, delete user
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ComponentUsersManage;
