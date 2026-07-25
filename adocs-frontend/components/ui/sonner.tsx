"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast !shadow-none !rounded-xl !border",
          title: "text-md !font-[700]",
          description: "text-sm !font-[400]",
          info: "dark:!bg-cyan-600 dark:!text-white dark:!border-cyan-400",
          warning: "dark:!bg-yellow-500 dark:!text-white dark:!border-yellow-200",
          success: "dark:!bg-emerald-600 dark:!text-white dark:!border-emerald-400",
          error: "dark:!bg-rose-600 dark:!text-white dark:!border-rose-500",
          loading: "!text-black/85 dark:!text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
