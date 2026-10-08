"use client";
import SystemNavigation from "@/components/system/shared/SystemNavigation";
export default function Sidebar({ isCollapsed = false }: { isCollapsed?: boolean }) {
  return <SystemNavigation role="admin" isCollapsed={isCollapsed} />;
}
