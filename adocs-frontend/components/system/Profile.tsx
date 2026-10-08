"use client";
import LoadingSection from "@/components/feedback/LoadingSection";
import { useLoadingTasks } from "@/components/feedback/useLoadingTasks";
import RecordStatus from "@/components/system/shared/RecordStatus";
import SystemPageHeader from "@/components/system/shared/SystemPageHeader";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, Box, Database, KeyRound, Mail, Trash2 } from "lucide-react";
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
    <LoadingSection loading={loading} layout="profile">
      <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
        <SystemPageHeader title="Profile" description="Your account, security and resources." />
        <Card className="gap-0 overflow-hidden rounded-2xl shadow-none">
          <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 text-xl font-semibold text-white">{allData.username?.slice(0, 2).toUpperCase() || "AD"}</span>
            <div className="min-w-0 flex-1 space-y-2"><h2 className="break-all text-2xl font-semibold tracking-tight">{allData.username}</h2><p className="flex items-start gap-2 text-sm text-muted-foreground"><Mail className="mt-0.5 size-4 shrink-0" /><span className="break-all">{allData.email}</span></p></div>
            <RecordStatus status={allData.role} tone="neutral" />
          </CardContent>
        </Card>
        <div className="grid items-stretch gap-5 lg:grid-cols-2">
          <Card className="rounded-2xl shadow-none">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><KeyRound className="size-4 text-sky-500" />Password & security</CardTitle><CardDescription className="text-xs">Changing your password also updates your connected database credentials.</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={toRePasswordProfile} className="space-y-5">
                <Field><FieldLabel htmlFor="current-password">Current password</FieldLabel><Input id="current-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-10" required /></Field>
                <Field><FieldLabel htmlFor="new-password">New password</FieldLabel><Input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="h-10" required /><FieldDescription className="text-xs">Choose a strong password for your account.</FieldDescription></Field>
                <div className="flex justify-end"><Button type="submit"><KeyRound />Update password</Button></div>
              </form>
            </CardContent>
          </Card>
          <div className="flex flex-col gap-5 lg:[&>div]:flex-1">
            <Card className="rounded-2xl shadow-none">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Box className="size-4 text-violet-500" />Container capacity</CardTitle><CardDescription className="text-xs">Resources available to your account.</CardDescription></CardHeader>
              <CardContent className="space-y-4"><div className="flex items-end justify-between"><p className="text-3xl font-semibold tabular-nums">{used}<span className="ml-2 text-base font-normal text-muted-foreground">/ {limit}</span></p><span className="text-xs text-muted-foreground">{capacity}% used</span></div><Progress value={capacity} aria-label="Container capacity used" className="h-2" /><p className="text-xs text-muted-foreground">{Math.max(0, limit - used)} containers available</p></CardContent>
            </Card>
            <Card className="rounded-2xl shadow-none">
              <CardHeader><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-base"><Database className="size-4 text-teal-500" />Database</CardTitle><RecordStatus status={allData.db ? "Connected" : "Not connected"} /></div><CardDescription className="text-xs">{allData.db ? "Your database account is ready to use." : "Request database access for your projects."}</CardDescription></CardHeader>
              <CardFooter>{allData.db ? <Button asChild variant="outline"><a href="https://pma.addp.site" target="_blank" rel="noopener noreferrer">Open phpMyAdmin<ArrowUpRight /></a></Button> : <Button variant="outline" onClick={toRequestDatabase}><Database />Request access</Button>}</CardFooter>
            </Card>
          </div>
        </div>
        <Card className="gap-4 rounded-2xl border-destructive/20 shadow-none">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Trash2 className="size-4 text-destructive" />Delete account</CardTitle><CardDescription className="text-xs">Permanently delete your account, containers, domains and associated data.</CardDescription></CardHeader>
          <CardFooter className="flex-wrap justify-between gap-3"><p className="text-xs text-muted-foreground">{allData.role === "admin" ? "Administrator accounts cannot be deleted here." : "This action cannot be undone."}</p>
            <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" disabled={allData.role === "admin"}><Trash2 />Delete account</Button></AlertDialogTrigger>
              <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete your account?</AlertDialogTitle><AlertDialogDescription>This permanently removes your account and all associated containers, domains and data. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={toDeleteUser}>Delete account</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </LoadingSection>
  );
};
export default ComponentProfile;