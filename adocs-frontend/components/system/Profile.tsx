"use client";
import LoadingSection from "@/components/feedback/LoadingSection";
import { useLoadingTasks } from "@/components/feedback/useLoadingTasks";
import RecordStatus from "@/components/system/shared/RecordStatus";
import SystemPage from "@/components/system/shared/SystemPage";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, Database, KeyRound, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
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

const ComponentProfile = () => {
  const { loading, run } = useLoadingTasks(["fetchProfileData"]);
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
      } catch {
        toast.error("Error Fetch Data", {
          description: "Server error 500",
        });
      }
    };
    void run("fetchProfileData", fetchProfileData);
  }, [run]);
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
    } catch {
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
    } catch {
      toast.dismiss(toastID);
      toast.error("Error", { description: "Server Error 500" });
    }
  };
  const toDeleteUser = async () => {
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
    } catch {
      toast.dismiss(toastID);
      toast.error("Error", { description: "Server Error 500" });
    }
  };
  const used = Math.max(0, Number(allData.container) || 0);
  const limit = Math.max(0, Number(allData.maxContainers) || 0);
  const capacity = limit > 0 ? Math.min(100, Math.round(used / limit * 100)) : 0;
  return (
    <SystemPage title="Profile" description="Your account, security and resources." className="max-w-5xl">
      <LoadingSection loading={loading} layout="profile">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="gap-0 py-4 shadow-none lg:col-span-3">
            <CardContent className="flex items-center gap-3 px-4 sm:px-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium uppercase">{allData.username?.slice(0, 2) || "AD"}</span>
              <div className="min-w-0 flex-1">
                <h2 className="break-all text-base font-semibold tracking-tight">{allData.username}</h2>
                <p className="break-all text-sm text-muted-foreground">{allData.email}</p>
              </div>
              <RecordStatus status={allData.role} tone="neutral" dot={false} />
            </CardContent>
          </Card>
          <Card className="min-w-0 gap-5 py-5 shadow-none lg:col-span-2">
            <CardHeader className="gap-1 px-4 sm:px-5">
              <CardTitle className="text-base">Password & security</CardTitle>
              <CardDescription>Changing your password also updates your connected database credentials.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col px-4 sm:px-5">
              <form onSubmit={toRePasswordProfile} className="flex flex-1 flex-col gap-5">
                <Field className="gap-2"><FieldLabel htmlFor="current-password">Current password</FieldLabel><Input id="current-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></Field>
                <Field className="gap-2"><FieldLabel htmlFor="new-password">New password</FieldLabel><Input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /><FieldDescription className="text-xs">Choose a strong password for your account.</FieldDescription></Field>
                <div className="mt-auto flex justify-end border-t pt-4"><Button type="submit" className="w-full sm:w-auto"><KeyRound aria-hidden="true" />Update password</Button></div>
              </form>
            </CardContent>
          </Card>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
            <Card className="h-full min-h-48 gap-4 py-5 shadow-none">
              <CardHeader className="gap-1 px-4 sm:px-5">
                <CardTitle className="text-base">Container capacity</CardTitle>
                <CardDescription>Resources available to your account.</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-3 px-4 sm:px-5">
                <p className="text-2xl font-semibold tracking-tight tabular-nums">{used}<span className="ml-1 text-sm font-normal text-muted-foreground">/ {limit}</span></p>
                <Progress value={capacity} aria-label="Container capacity used" />
                <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground"><span>{capacity}% used</span><span>{Math.max(0, limit - used)} containers available</span></div>
              </CardContent>
            </Card>
            <Card className="h-full min-h-48 gap-4 py-5 shadow-none">
              <CardHeader className="gap-1 px-4 sm:px-5">
                <div className="flex items-center justify-between gap-2"><CardTitle className="text-base">Database</CardTitle><RecordStatus status={allData.db ? "Connected" : "Not connected"} /></div>
                <CardDescription>{allData.db ? "Your database account is ready to use." : "Request database access for your projects."}</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto px-4 sm:px-5">{allData.db ? <Button asChild variant="outline" className="w-full"><a href="https://pma.addp.site" target="_blank" rel="noopener noreferrer">Open phpMyAdmin<ArrowUpRight aria-hidden="true" /></a></Button> : <Button variant="outline" className="w-full" onClick={toRequestDatabase}><Database aria-hidden="true" />Request access</Button>}</CardFooter>
            </Card>
          </div>
          <Card className="gap-4 border-destructive/30 py-5 shadow-none lg:col-span-3">
            <CardContent className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="space-y-1">
                <CardTitle className="text-base">Delete account</CardTitle>
                <CardDescription>Permanently delete your account, containers, domains and associated data.</CardDescription>
                <p className="text-xs text-muted-foreground">{allData.role === "admin" ? "Administrator accounts cannot be deleted here." : "This action cannot be undone."}</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="destructive" className="shrink-0" disabled={allData.role === "admin"}><Trash2 aria-hidden="true" />Delete account</Button></AlertDialogTrigger>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete your account?</AlertDialogTitle><AlertDialogDescription>This permanently removes your account and all associated containers, domains and data. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={toDeleteUser}>Delete account</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </LoadingSection>
    </SystemPage>
  );
};
export default ComponentProfile;
