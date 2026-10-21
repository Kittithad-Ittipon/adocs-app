"use client";
import DashboardOverview from "@/components/system/shared/DashboardOverview";
import { useLoadingTasks } from "@/components/feedback/useLoadingTasks";
import { CloudUpload, Database, FileText, History } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
type containersItem = {
  containerName: string;
  domain: string;
  image: string;
  upDateTime: string;
  status: string;
};

type usersData = {
  username: string;
  email: string;
  db: boolean;
  container: string;
  maxContainers: string;
  role: string;
  userUploadTotal: number;
};

const UserDashboard = () => {
  const { loading, run } = useLoadingTasks(["fetchUserData", "fetchContainersData"]);
  const [allData, setAllData] = useState<containersItem[]>([]);
  const [stats, setStats] = useState<usersData>({
    username: "Loading...",
    email: "Loading...",
    db: false,
    container: "1",
    maxContainers: "1",
    role: "Loading...",
    userUploadTotal: 0,
  });
  useEffect(() => {
    const fetchUserData = async () => {
      const toastID = "toast-users-data";
      try {
        const res = await fetch(`/api/users/profile`, { method: "GET" });
        if (!res.ok) {
          toast.error("Error Fetch Data", {
            description: "Failed to load",
            id: toastID,
          });
          return;
        }
        const data = await res.json();
        setStats(data);
      } catch {
        toast.error("Error Fetch Data", {
          description: "Server error 500",
          id: toastID,
        });
      }
    };
    void run("fetchUserData", fetchUserData);
  }, [run]);
  useEffect(() => {
    const fetchContainersData = async () => {
      const toastID = "toast-containers-data";
      try {
        const res = await fetch("/api/containers", { method: "GET" });
        if (!res.ok) {
          toast.error("Error Fetch Data", {
            description: "Failed to load",
            id: toastID,
          });
          return;
        }
        const data = await res.json();
        setAllData(data);
      } catch {
        toast.error("Error Fetch Data", {
          description: "Server error 500",
          id: toastID,
        });
      }
    };
    void run("fetchContainersData", fetchContainersData);
  }, [run]);
  const dashboardData = [
    {
      title: "Uploads",
      description: "Total number of your uploaded projects.",
      value: stats.userUploadTotal,
      icon: CloudUpload,
    },
    {
      title: "Logs",
      description: "Monitor activity and view system logs.",
      value: "View Logs",
      icon: History,
      href: "/users/logs",
    },
    {
      title: "phpMyAdmin",
      description: "Manage your database tables.",
      value: "Access Database",
      icon: Database,
      href: "https://pma.addp.site",
    },
    {
      title: "Documents",
      description: "Read user guides and platform tutorials.",
      value: "Read Docs",
      icon: FileText,
      href: "https://document.adocs.site/docs",
    },
  ];

  return (
    <DashboardOverview role="user" loading={loading} metrics={dashboardData} records={allData} />
  );
};
export default UserDashboard;
