"use client";
import DashboardOverview from "@/components/system/shared/DashboardOverview";
import { useLoadingTasks } from "@/components/feedback/useLoadingTasks";
import { CloudUpload, DatabaseZap, SquareActivity, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
type containersItem = {
  containerName: string;
  domain: string;
  image: string;
  upDateTime: string;
  status: string;
};

type adminData = {
  username: string;
  email: string;
  db: boolean;
  container: string;
  maxContainers: string;
  role: string;
  usersTotal: number;
  requestTotal: number;
  uploadTotal: number;
};

const AdminDashboard = () => {
  const { loading, run } = useLoadingTasks(["fetchAdminData", "fetchContainersData"]);
  const [allData, setAllData] = useState<containersItem[]>([]);
  const [stats, setStats] = useState<adminData>({
    username: "Loading...",
    email: "Loading...",
    db: true,
    container: "1",
    maxContainers: "1",
    role: "Loading...",
    usersTotal: 0,
    requestTotal: 0,
    uploadTotal: 0,
  });
  const dashboardData = [
    {
      title: "Total Users",
      description: "All registered user accounts.",
      value: stats.usersTotal,
      icon: Users,
    },
    {
      title: "Total Uploads",
      description: "Total number of uploaded projects.",
      value: stats.uploadTotal,
      icon: CloudUpload,
    },
    {
      title: "Database requests",
      description: "Pending database creation requests.",
      value: stats.requestTotal,
      icon: DatabaseZap,
    },
    {
      title: "Monitoring",
      description: "Real-time server monitoring system.",
      value: "Open Beszel",
      icon: SquareActivity,
      href: "https://beszel.addp.site",
    },
  ];
  useEffect(() => {
    const fetchAdminData = async () => {
      const toastID = "toast-admin-data";
      try {
        const res = await fetch("/api/dashboard", { method: "GET" });
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
    void run("fetchAdminData", fetchAdminData);
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
  return (
    <DashboardOverview role="admin" loading={loading} metrics={dashboardData} records={allData} />
  );
};
export default AdminDashboard;
