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
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
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
          toast: "cn-toast !gap-2.5 !rounded-lg !border !font-sans !shadow-lg !shadow-black/5",
          title: "!text-sm !font-medium",
          description: "!text-xs !font-normal !text-muted-foreground",
          success: "[&_[data-icon]]:text-emerald-500",
          info: "[&_[data-icon]]:text-sky-500",
          warning: "[&_[data-icon]]:text-amber-500",
          error: "[&_[data-icon]]:text-red-500",
          loading: "[&_[data-icon]]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
