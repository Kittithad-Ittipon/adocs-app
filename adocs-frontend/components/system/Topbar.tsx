"use client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { systemMenu, type SystemRole } from "@/components/system/shared/SystemNavigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function Topbar({ role }: { role: SystemRole }) {
  const pathname = usePathname();
  const page = systemMenu(role).find((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
  return (
    <header className="sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center gap-4 border-b bg-background/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <SidebarTrigger className="-ml-2 size-9 [&_svg:not([class*='size-'])]:size-[18px]" />
      <Separator orientation="vertical" className="data-vertical:h-5 data-vertical:self-center" />
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap text-base">
          <BreadcrumbItem className="hidden sm:inline-flex">{role === "admin" ? "Admin" : "Workspace"}</BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem className="min-w-0"><BreadcrumbPage className="truncate font-medium">{page?.label ?? "ADOCS"}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <ThemeToggle className="-mr-2 ml-auto size-11 [&_svg]:size-6" />
    </header>
  );
}
