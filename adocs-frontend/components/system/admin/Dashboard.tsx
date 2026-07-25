"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowRight,
  ArrowUpRight,
  CloudUpload,
  SquareActivity,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BsDatabaseAdd } from "react-icons/bs";
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
      iconColor: "text-sky-500",
    },
    {
      title: "Total Uploads",
      description: "Total number of uploaded projects.",
      value: stats.uploadTotal,
      icon: CloudUpload,
      iconColor: "text-cyan-500",
    },
    {
      title: "Total Requests Database",
      description: "Pending database creation requests.",
      value: stats.requestTotal,
      icon: BsDatabaseAdd,
      iconColor: "text-teal-500",
    },
    {
      title: "Monitoring",
      description: "Real-time server monitoring system.",
      value: "Open Beszel",
      icon: SquareActivity,
      iconColor: "text-emerald-500",
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
      } catch (error) {
        toast.error("Error Fetch Data", {
          description: "Server error 500",
          id: toastID,
        });
      }
    };
    fetchAdminData();
  }, []);
  useEffect(() => {
    const fetchContainersData = async () => {
      const toastID = "toast-containers-data";
      try {
        const res = await fetch("/api/containers", { method: "GET" });
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
    fetchContainersData();
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
            <BreadcrumbPage className="font-[600]">Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full p-4 md:px-8">
        {dashboardData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-[oklch(0.2_0_0)] rounded-xl border py-7 px-4 flex flex-col items-start"
            >
              <div className="flex items-center w-full justify-between">
                <div className="text-md font-[600] mb-2">{item.title}</div>
                <IconComponent className={`w-7 h-7 ${item.iconColor}`} />
              </div>
              <div className="text-gray-500 font-[400] text-sm">
                {item.description}
              </div>
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl font-[800] mt-10 text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-300 flex items-center gap-2 transition-all"
                >
                  {item.value} <ArrowRight size={26} />
                </a>
              ) : (
                <div className={`text-4xl font-[800] mt-10 ${item.iconColor}`}>
                  {item.value}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="w-full min-h-[500px] p-4 md:px-8">
        <div className="border rounded-xl overflow-hidden w-full max-h-[500px] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Table className="w-full">
            <TableHeader className="bg-muted/50">
              <TableRow className="text-sm text-muted-foreground">
                <TableHead className="font-semibold px-6 h-12">NO.</TableHead>
                <TableHead className="font-semibold px-6 h-12">
                  CONTAINER NAME
                </TableHead>
                <TableHead className="font-semibold h-12 py-5">
                  DOMAIN
                </TableHead>
                <TableHead className="font-semibold h-12">IMAGE</TableHead>
                <TableHead className="font-semibold h-12">UPDATE</TableHead>
                <TableHead className="font-semibold h-12 text-center">
                  STATUS
                </TableHead>
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
                      className="max-w-[200px] truncate font-medium"
                      title={value.containerName}
                    >
                      {value.containerName}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <a
                      href={`https://${value.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 group text-foreground hover:text-sky-500 dark:hover:text-cyan-300 transition-colors"
                    >
                      <span className="max-w-[150px] truncate">
                        {value.domain}
                      </span>
                      <ArrowUpRight
                        size={14}
                        className="opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
                      />
                    </a>
                  </TableCell>
                  <TableCell className="py-4">
                    <span
                      className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium max-w-[120px] truncate inline-block"
                      title={value.image}
                    >
                      {value.image}
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
                        value.status === "running"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {value.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {allData.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={6}
                    className="py-5 text-center text-muted-foreground font-medium"
                  >
                    No Results Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
