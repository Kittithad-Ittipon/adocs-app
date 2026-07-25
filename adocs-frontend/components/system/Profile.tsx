"use client";

import { BsDatabaseCheck, BsDatabaseExclamation } from "react-icons/bs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Input } from "../ui/input";
import { Field, FieldLabel } from "../ui/field";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
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
} from "../ui/alert-dialog";
import {
  CircleQuestionMark,
  Mail,
  Server,
  ShieldUser,
  Trash2Icon,
  TriangleAlert,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Progress } from "../ui/progress";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type usersData = {
  username: string;
  email: string;
  db: boolean;
  container: string;
  maxContainers: string;
  role: string;
  userUploadTotal: number;
};

const ComponentProfile = () => {
  const [allData, setAllData] = useState<usersData>({
    username: "Loading...",
    email: "Loading...",
    db: false,
    container: "1",
    maxContainers: "1",
    role: "Loading...",
    userUploadTotal: 0,
  });
  const [password, setPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const rounter = useRouter();
  useEffect(() => {
    const fetchProfileData = async () => {
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
    fetchProfileData();
  }, []);
  const toRePasswordProfile = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const username = allData.username;
    const toastID = toast.loading("Loading...");
    try {
      const res = await fetch(`/api/users/${username}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Error", { id: toastID, description: data.error });
        return;
      }
      toast.success("Change Success", {
        id: toastID,
        description: data.message,
      });
      setPassword("");
      setNewPassword("");
    } catch (error) {
      toast.dismiss(toastID);
      toast.error("Error", { description: "Server Error 500" });
    }
  };
  const toRequestDatabase = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const username = allData.username;
    const toastID = toast.loading("Loading...");
    try {
      const res = await fetch(`/api/users/${username}/requestDB`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestDB: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Error", { id: toastID, description: data.error });
        return;
      }
      toast.success("Request Success", {
        id: toastID,
        description: data.message,
      });
    } catch (error) {
      toast.dismiss(toastID);
      toast.error("Error", { description: "Server Error 500" });
    }
  };
  const toDeleteUser = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const toastID = toast.loading("Loading...");
    const username = allData.username;
    try {
      const res = await fetch(`/api/users/${username}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Error", { id: toastID, description: data.error });
        return;
      }
      await fetch("/api/auth/logout", { method: "DELETE" });
      toast.success("Delete Success Bye!", {
        id: toastID,
        description: data.message,
      });
      rounter.refresh();
      rounter.replace("/login");
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
            <BreadcrumbPage className="font-[600]">Profile</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="min-w-screen xl:min-w-0 xl:max-w-screen min-h-[700px]">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full p-4 md:px-8 h-full">
          <div className="grid grid-cols-1 w-full gap-4">
            <div className="border rounded-xl gap-6 p-6 flex flex-col lg:flex-row transition-all min-h-[250px]">
              <div className="flex justify-center mb-5 md:mb-0 items-center md:justify-start">
                <div className="h-35 w-35 md:h-35 md:w-35 rounded-full flex items-center justify-center text-5xl font-[700] text-white bg-sky-400 dark:bg-cyan-500">
                  {allData.username?.substring(0, 2).toUpperCase() || "AD"}
                </div>
              </div>
              <div className="flex flex-col gap-3 justify-center items-start w-full h-full">
                <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                  <ShieldUser className="text-sky-500 dark:text-cyan-300 w-6 h-6" />
                  <p className="font-semibold text-lg max-w-[250px] truncate">
                    {allData.username}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-white">
                  <Mail className="text-sky-500 dark:text-cyan-300 w-5 h-5 ml-0.5" />
                  <p className="font-medium text-md max-w-[250px] truncate">
                    {allData.email}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-white">
                  <MdOutlineAdminPanelSettings className="text-sky-500 dark:text-cyan-300 w-6 h-6 ml-0.5" />
                  <p className="font-medium text-md max-w-[250px] truncate">
                    {allData.role}
                  </p>
                </div>
              </div>
            </div>
            <div className="border rounded-xl p-6 transition-all min-h-[450px]">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-zinc-800 pb-4">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  Change Password
                </h3>
                <HoverCard openDelay={10} closeDelay={200}>
                  <HoverCardTrigger asChild>
                    <span className="bg-transparent text-black dark:text-white flex justify-center items-center rounded-lg transition duration-200">
                      <CircleQuestionMark className="w-5 h-5" />
                    </span>
                  </HoverCardTrigger>
                  <HoverCardContent
                    className="flex w-75 flex-col gap-3"
                    side="right"
                  >
                    <div className="w-full flex flex-col gap-2">
                      <div className="font-[600] text-md">
                        Password Synchronization Notice
                      </div>
                      <div className="text-sm font-[300]">
                        Please note that updating your account password here
                        will automatically sync and update the credentials for
                        your connected database account.
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <form
                action="#"
                className="flex flex-col gap-5"
                onSubmit={toRePasswordProfile}
              >
                <Field>
                  <FieldLabel htmlFor="new-password">Password</FieldLabel>
                  <Input
                    id="new-password"
                    type="password"
                    className="h-12 shadow-none"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    autoComplete="off"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === " ") {
                        e.preventDefault();
                      }
                    }}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirm-password">
                    New Password
                  </FieldLabel>
                  <Input
                    id="confirm-password"
                    type="password"
                    className="h-12 shadow-none"
                    placeholder="Enter New password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === " ") {
                        e.preventDefault();
                      }
                    }}
                  />
                </Field>
                <div className="w-full mt-6 flex justify-start xl:justify-center items-center">
                  <Button className="flex items-center w-full xl:w-1/1 shadow-none h-12 rounded-xl bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-[600] text-sm transition-all cursor-pointer">
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          </div>
          <div className="grid grid-cols-1 w-full gap-4">
            <div className="border rounded-xl p-6 transition-all min-h-[400px] flex flex-col">
              <div className="flex items-center gap-3 mb-6 pb-4">
                <Server className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  Resource Usage
                </h3>
              </div>
              <div className="flex flex-col items-center justify-center flex-1 w-full gap-8">
                <div className="flex flex-col items-center justify-center w-40 h-40 rounded-full border-[12px] border-sky-50 dark:border-cyan-900/20 transition-all">
                  <span className="text-4xl xl:text-5xl font-bold text-sky-500 dark:text-cyan-300 tracking-tighter">
                    {Math.round(
                      (parseInt(allData.container) /
                        parseInt(allData.maxContainers)) *
                        100,
                    )}
                    %
                  </span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                    Capacity Used
                  </span>
                </div>
                <Field className="w-full max-w-sm">
                  <FieldLabel
                    htmlFor="progress-container"
                    className="flex items-center w-full mb-3"
                  >
                    <span className="text-sm font-medium">
                      Containers Allocated
                    </span>
                    <span className="ml-auto font-bold px-3 py-1 rounded-full text-xs">
                      {allData.container} / {allData.maxContainers}
                    </span>
                  </FieldLabel>
                  <Progress
                    value={Math.round(
                      (parseInt(allData.container) /
                        parseInt(allData.maxContainers)) *
                        100,
                    )}
                    id="progress-container"
                    className="h-3"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center leading-relaxed">
                    You are currently using <strong>{allData.container}</strong>{" "}
                    containers and can create{" "}
                    <strong>
                      {parseInt(allData.maxContainers) -
                        parseInt(allData.container)}
                    </strong>{" "}
                    more.
                  </p>
                </Field>
              </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-[250px]">
              <div className="border rounded-xl p-6 transition-all flex flex-col justify-center items-center">
                {allData.db ? (
                  <div className="flex flex-col items-center justify-between h-full gap-4 w-full">
                    <div className="flex flex-col items-center">
                      <div className="p-3  bg-green-100 dark:bg-green-900/30 rounded-full">
                        <BsDatabaseCheck className="w-8 h-8 text-green-600 dark:text-green-500" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg mb-2">
                        Database Connected
                      </h3>
                      <p className="text-sm text-gray-500">
                        Your account is successfully synced. <br /> <br />
                      </p>
                    </div>
                    <div className="w-full flex justify-center items-center">
                      <Button
                        onClick={() => {
                          toast.info("Database account already exists", {
                            description: "You already have a database account.",
                          });
                        }}
                        className="cursor-pointer mt-2 rounded-lg shadow-none font-[500] bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500 dark:text-white dark:hover:bg-green-600 w-full md:w-1/2 xl:w-full"
                      >
                        Request Database Account
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-between h-full gap-4 w-full">
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                        <BsDatabaseExclamation className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg mb-2">
                        No Database Account
                      </h3>
                      <p className="text-sm text-gray-500">
                        You don't have a connected database yet. <br /> <br />
                      </p>
                    </div>
                    <div className="w-full flex justify-center items-center">
                      <Button
                        onClick={toRequestDatabase}
                        className="cursor-pointer mt-2 rounded-lg shadow-none font-[500] bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500 dark:text-white dark:hover:bg-amber-600 w-full md:w-1/2 xl:w-full"
                      >
                        Request Database Account
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="border border-red-200 dark:border-red-900/50 rounded-xl p-6 transition-all flex flex-col items-center justify-between gap-4 w-full">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <TriangleAlert className="w-8 h-8 text-red-600 dark:text-red-500" />
                </div>
                <div className="font-[700] text-lg text-red-600 w-full flex justify-center items-center flex-col mb-5 md:mb-0">
                  <p className="mb-2">Delete Account</p>
                  <div className="font-[400] text-sm text-gray-500">
                    Permanently remove your account and all of its contents from
                    the platform. This action is not reversible.
                  </div>
                </div>
                <div className="w-full flex justify-center items-center">
                  {allData.role === "admin" ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="cursor-pointer w-full shadow-none font-[500] dark:bg-red-500 dark:hover:bg-red-700 dark:text-white md:w-1/2 xl:w-full"
                        >
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent size="sm" className="!max-w-[500px]">
                        <AlertDialogHeader>
                          <AlertDialogMedia className="dark:bg-red-500 bg-red-100 text-red-600 dark:text-white">
                            <Trash2Icon />
                          </AlertDialogMedia>
                          <AlertDialogTitle className="font-[700]">
                            Action Denied
                          </AlertDialogTitle>
                          <AlertDialogDescription className="flex flex-col gap-3 text-left mt-2">
                            <span>
                              This action cannot be undone. Your account will be
                              permanently deleted.
                            </span>
                            <span className="p-3 bg-red-50 dark:bg-red-500 rounded-lg border border-red-100 dark:border-red-900/50 flex flex-col gap-1 text-slate-800 dark:text-slate-200 text-sm">
                              <span className="max-w-[300px] truncate">
                                <strong>Username</strong> {allData.username}
                              </span>
                              <span className="max-w-[300px] truncate">
                                <strong>Email</strong> {allData.email}
                              </span>
                            </span>
                            <span>
                              You cannot delete an{" "}
                              <strong>Administrator</strong> account from the
                              system. Please contact the super admin if you need
                              further assistance.
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4 !flex">
                          <AlertDialogCancel
                            variant="outline"
                            className="!shadow-none w-full"
                          >
                            Cancel
                          </AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="cursor-pointer w-full shadow-none font-[500] dark:bg-red-500 dark:hover:bg-red-700 dark:text-white md:w-1/2 xl:w-full"
                        >
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent size="sm" className="!max-w-[500px]">
                        <AlertDialogHeader>
                          <AlertDialogMedia className="dark:bg-red-500 bg-red-100 text-red-600 dark:text-white">
                            <Trash2Icon />
                          </AlertDialogMedia>
                          <AlertDialogTitle className="font-[700]">
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="flex flex-col gap-3 text-left mt-2">
                            <span>
                              This action cannot be undone. Your account will be
                              permanently deleted.
                            </span>

                            <span className="p-3 bg-red-50 dark:bg-red-500 rounded-lg border border-red-100 dark:border-red-900/50 flex flex-col gap-1 text-slate-800 dark:text-slate-200 text-sm">
                              <span className="max-w-[300px] truncate">
                                <strong>Username</strong> {allData.username}
                              </span>
                              <span className="max-w-[300px] truncate">
                                <strong>Email</strong> {allData.email}
                              </span>
                            </span>

                            <span>
                              Including all your{" "}
                              <strong>Containers, Domains</strong>, and data on
                              the platform will be permanently wiped.
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4">
                          <AlertDialogCancel
                            variant="outline"
                            className="!shadow-none cursor-pointer cursor-pointer"
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            className="shadow-none dark:bg-red-500 dark:hover:bg-red-700 dark:text-white cursor-pointer"
                            onClick={toDeleteUser}
                          >
                            Yes, delete everything
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ComponentProfile;
