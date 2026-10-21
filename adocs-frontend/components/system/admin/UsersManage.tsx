"use client";
import RecordStatus from "@/components/system/shared/RecordStatus";
import SearchInput from "@/components/system/shared/SearchInput";
import StatCard from "@/components/system/shared/StatCard";
import SystemPage from "@/components/system/shared/SystemPage";
import UserRecords from "@/components/system/shared/UserRecords";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Box, Database, Users } from "lucide-react";

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
  FieldDescription,
  FieldLabel
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { pollCeleryTask } from "@/lib/task-check";
import { Server, Trash2Icon } from "lucide-react";
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
  const stats = [
    { label: "Accounts", value: usersData.length, icon: Users },
    { label: "Database access", value: usersData.filter((user) => user.db).length, icon: Database },
    { label: "Database requests", value: usersData.filter((user) => user.requestDB).length, icon: Box },
  ];
  return (
    <SystemPage title="Users" description="Manage user accounts, container limits and database access.">
      <LoadingSection loading={loading} stats={3}>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">{stats.map((item) => <StatCard key={item.label} {...item} />)}</div>
          <UserRecords headerContent={<SearchInput value={search} onChange={setSearch} placeholder="Search username or email" label="Search users" />} records={usersData.filter((user) => (user.username + " " + (user.email || "")).toLowerCase().includes(search.toLowerCase()))} onEdit={(record) => {
            setSelectedUsers(record);
            setMaxContainers(record.maxContainer);
            setUseDB(record.db);
            setIsOpen(true);
          }} />
        </div>
      </LoadingSection>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!saving) setIsOpen(open); }}>
        <DialogContent className="sm:max-w-md" onEscapeKeyDown={(event) => { if (saving) event.preventDefault(); }} onInteractOutside={(event) => { if (saving) event.preventDefault(); }}>
          <DialogHeader>
            <DialogTitle className="break-all">{selectedUsers?.username}</DialogTitle>
            <DialogDescription className="break-all">{selectedUsers?.email || "-"}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
            <RecordStatus status={selectedUsers?.role || "User"} tone="neutral" dot={false} />
            <span className="inline-flex items-center gap-1.5"><Server className="size-3.5" aria-hidden="true" />{selectedUsers?.container || 0} / {selectedUsers?.maxContainer || 0} containers</span>
          </div>
          <form id="form-edit-users" onSubmit={toEditUsers} className="space-y-4">
            <Field className="gap-2">
              <FieldLabel htmlFor="input-containers">Maximum containers</FieldLabel>
              <Input id="input-containers" type="text" placeholder="5 - 10" value={maxContainers} disabled={saving} onChange={(event) => setMaxContainers(event.target.value)} />
              <FieldDescription className="text-xs">Set the maximum number of containers allowed (5 to 10).</FieldDescription>
            </Field>
            <Field orientation="horizontal" className="rounded-lg border px-3 py-2.5">
              <FieldLabel htmlFor="switch-db">Database access</FieldLabel>
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
    </SystemPage>
  );
};
export default ComponentUsersManage;
