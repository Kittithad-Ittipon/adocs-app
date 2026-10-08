"use client";
import RecordStatus from "@/components/system/shared/RecordStatus";
import SystemPageHeader from "@/components/system/shared/SystemPageHeader";
import UserRecords from "@/components/system/shared/UserRecords";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Box, Database, Search, Users } from "lucide-react";

import LoadingSection from "@/components/feedback/LoadingSection";
import { useLoadingTasks } from "@/components/feedback/useLoadingTasks";

import React, { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { pollCeleryTask } from "@/lib/task-check";
import {
  Mail,
  Server,
  Trash2Icon,
  UserCog
} from "lucide-react";
import { toast } from "sonner";

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
  const { loading, run } = useLoadingTasks(["fetchContainersData"]);
  const [search, setSearch] = useState(""); const [isOpen, setIsOpen] = useState(false); const [saving, setSaving] = useState(false);
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
          toast.error("Error Fetch Data", {
            description: "Failed to load",
            id: toastID,
          });
          return;
        }
        const data = await res.json();
        setUsersData(data);
      } catch {
        toast.error("Error Fetch Data", {
          description: "Server error 500",
          id: toastID,
        });
      }
    };
    void run("fetchContainersData", fetchContainersData);
  }, [reFresh, run]);
  const toEditUsers = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); if (saving || !selectedUsers) return; setSaving(true);
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
      }); setReFresh(Date.now()); setIsOpen(false);
    } catch {
      toast.dismiss(toastID);
      toast.error("Error", { description: "Server Error 500" });
    } finally { setSaving(false); }
  };
  const toDeleteUser = async () => {
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
    } catch {
      toast.dismiss(toastID);
      toast.error("Error", { description: "Server Error 500" });
    }
  };
  return (
    <LoadingSection loading={loading} layout="table">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <SystemPageHeader title="Users" description="Manage user accounts, container limits and database access." />
        <div className="grid gap-3 sm:grid-cols-3">{[{ label: "Accounts", value: usersData.length, icon: Users }, { label: "Database access", value: usersData.filter((user) => user.db).length, icon: Database }, { label: "Database requests", value: usersData.filter((user) => user.requestDB).length, icon: Box }].map((item) => <Card key={item.label} className="rounded-xl py-4 shadow-none"><CardContent className="flex items-center justify-between gap-3 px-4"><div><p className="text-xs text-muted-foreground">{item.label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{item.value}</p></div><item.icon className="size-5 text-sky-500" /></CardContent></Card>)}</div>
        
        <UserRecords headerContent={<div className="relative w-full sm:w-64"><Search aria-hidden="true" className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search username or email" aria-label="Search users" className="pl-9" /></div>} records={usersData.filter((user) => (user.username + " " + (user.email || "")).toLowerCase().includes(search.toLowerCase()))} onEdit={(record) => {
          setSelectedUsers(record);
          setMaxContainers(record.maxContainer);
          setUseDB(record.db);
          setIsOpen(true);
        }} />
        <Dialog open={isOpen} onOpenChange={(open) => { if (!saving) setIsOpen(open); }}>
          <DialogContent className="sm:max-w-xl" onEscapeKeyDown={(event) => { if (saving) event.preventDefault(); }} onInteractOutside={(event) => { if (saving) event.preventDefault(); }}>
            <DialogHeader>
              <DialogTitle className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-300"><UserCog className="size-5" /></span><span className="break-all">{selectedUsers?.username}</span></DialogTitle>
              <DialogDescription>Update account resources and permissions.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 rounded-xl bg-muted/50 p-4 text-sm">
              <div className="flex min-w-0 items-center gap-2"><Mail className="size-4 shrink-0 text-muted-foreground" /><span className="break-all">{selectedUsers?.email || "-"}</span></div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground"><span className="flex items-center gap-2"><RecordStatus status={selectedUsers?.role || "User"} tone="neutral" /></span><span className="flex items-center gap-2"><Server className="size-4" />{selectedUsers?.container || 0} / {selectedUsers?.maxContainer || 0} containers</span></div>
            </div>
            <form id="form-edit-users" onSubmit={toEditUsers} className="space-y-5">
              <Field>
                <FieldLabel htmlFor="input-containers">Maximum containers</FieldLabel>
                <Input id="input-containers" type="text" className="h-10 shadow-none" placeholder="5 - 10" value={maxContainers} disabled={saving} onChange={(event) => setMaxContainers(event.target.value)} />
                <FieldDescription className="text-xs">Set the maximum number of containers allowed (5 to 10).</FieldDescription>
              </Field>
              <Field orientation="horizontal" className="rounded-xl border p-4">
                <FieldContent><FieldLabel htmlFor="switch-db">Database access</FieldLabel><FieldDescription className="text-xs">Allow this account to access its database.</FieldDescription></FieldContent>
                <Switch id="switch-db" checked={useDB} disabled={saving} onCheckedChange={setUseDB} />
              </Field>
            </form>
            <DialogFooter className="border-t pt-4">
              <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" disabled={saving} className="sm:mr-auto"><Trash2Icon />Delete user</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete {selectedUsers?.username}?</AlertDialogTitle><AlertDialogDescription>This permanently deletes the account and all associated containers, domains and database data. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={toDeleteUser}>Delete user</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
              <DialogClose asChild><Button variant="outline" disabled={saving}>Cancel</Button></DialogClose>
              <Button type="submit" form="form-edit-users" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </LoadingSection>
  );
};
export default ComponentUsersManage;
