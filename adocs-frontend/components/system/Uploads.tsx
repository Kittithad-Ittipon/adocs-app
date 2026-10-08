"use client";
import LoadingLine from "@/components/feedback/LoadingLine";
import MotionSurface from "@/components/feedback/MotionSurface";
import { useLoadingTasks } from "@/components/feedback/useLoadingTasks";
import SystemPageHeader from "@/components/system/shared/SystemPageHeader";
import { Card } from "@/components/ui/card";

import { cn } from "@/lib/utils";
import { pollCeleryTask } from "@/lib/task-check";
import {
  CircleCheck,
  CircleQuestionMark,
  CircleX,
  CloudUpload,
  LoaderCircle,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Input } from "../ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const ComponentUploads = () => {
  const { loading: isUploading, run } = useLoadingTasks([]);
  const uploadInFlight = useRef(false);
  const [file, setFile] = useState<File | null>(null); const [isDragging, setIsDragging] = useState(false); const dragDepth = useRef(0);
  const [serviceName, setServiceName] = useState<string>("");
  const [port, setPort] = useState<string>("");
  const [domain, setDomain] = useState<string>("");
  const [uploadType, setUploadType] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectFile = (files: FileList | null) => {
    if (uploadInFlight.current || !files?.length) return;
    if (files.length > 1) {
      toast.error("Please select one .zip file at a time.");
      return;
    }
    const selectedFile = files[0];
    if (!selectedFile.name.toLowerCase().endsWith(".zip")) {
      toast.error("Please select a .zip file.");
      return;
    }
    setFile(selectedFile);
  };
  const toCheckFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    selectFile(event.currentTarget.files);
    event.currentTarget.value = "";
  };
  const onDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (uploadInFlight.current || !event.dataTransfer.types.includes("Files")) return;
    dragDepth.current += 1;
    setIsDragging(true);
  };
  const onDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDragging(false);
  };
  const onDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = uploadInFlight.current ? "none" : "copy";
  };
  const onDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    selectFile(event.dataTransfer.files);
  };
  const toCancelFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const uploadProject = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (uploadInFlight.current) return;
    uploadInFlight.current = true;
    try {
      await run("upload", async () => {
        const toastID = "toast-upload";
        toast.loading("Loading...", { id: toastID });
        if (!file) {
          toast.error("Error", { description: "Select File !", id: toastID });
          return;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("serviceName", serviceName);
        formData.append("port", port);
        formData.append("domain", domain);
        formData.append("uploadType", uploadType);
        const res = await fetch("/api/containers", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) {
          console.log("API Error Response:", data);
          toast.error("Upload Failed", {
            description: data.error || "Failed to upload",
            id: toastID,
          });
          return;
        }
        toast.info("Uploading Container", {
          id: toastID,
          description: data.message,
        });
        setFile(null);
        setServiceName("");
        setPort("");
        setDomain("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        await pollCeleryTask(
          data.taskID,
          `Deploy '${serviceName}' Successfully`,
          `Deploy '${serviceName}' Failed `,
        );
      });
    } catch {
      toast.error("Upload failed", { id: "toast-upload", description: "Unable to complete the upload. Please try again." });
    } finally {
      uploadInFlight.current = false;
    }
  };
  return <MotionSurface className="w-full">
    <LoadingLine loading={isUploading} fixed label="Uploading project" />
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8 [&_[data-slot=field-description]]:text-xs">
      <SystemPageHeader title="Upload project" description="Deploy a new project or update an existing application." />
      <Card className="w-full rounded-2xl border bg-card p-4 shadow-none sm:p-6">
        <form
          action="#"
          id="form-upload"
          onSubmit={uploadProject}
          className="w-full h-full flex flex-col justify-start items-center"
        >
          <Field className="mb-4 md:mb-0">
            <FieldLabel htmlFor="file-upload">Project file</FieldLabel>
            <label
              htmlFor="file-upload"
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
              onDrop={onDrop}
              className={cn(
                "relative group flex w-full min-h-40 items-center justify-center rounded-xl border border-dashed p-5 focus-within:ring-2 focus-within:ring-ring motion-safe:transition-colors duration-200",
                isUploading ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                isDragging ? "border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/20" : "bg-muted/30 hover:bg-muted/60",
              )}
            >
              {file && (
                <div className="flex min-w-0 flex-col items-center justify-center gap-2">
                  <CircleCheck className="size-10 text-emerald-500" />
                  <p className="font-medium truncate max-w-48 sm:max-w-96 py-2 text-start md:text-center">
                    {file.name}
                  </p>
                  <p className="font-[400] text-gray-500 truncate max-w-50 flex items-center justify-center">
                    {(file.size / 1024 / 1024).toFixed(3)} MB
                  </p>
                  <button
                    onClick={toCancelFile} disabled={isUploading}
                    type="button"
                    className="text-red-400 hover:text-red-500 transition duration-200 flex items-center justify-center gap-1 underline md:mt-2 font-[500] cursor-pointer text-sm"
                  >
                    Remove File <CircleX className="w-4 h-4" />
                  </button>
                </div>
              )}
              {!file && (
                <div className="flex flex-col justify-center items-center gap-3">
                  <CloudUpload className="size-10 text-muted-foreground group-hover:text-sky-500 dark:group-hover:text-cyan-300 motion-safe:transition-colors duration-200" />
                  <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 text-center transition duration-200 text-xs md:text-sm md:px-5 md:mt-3">
                    {isDragging ? "Drop your .zip file here" : "Drag & drop your project, or click to browse"}
                  </span>
                </div>
              )}
              <input
                id="file-upload"
                type="file" accept=".zip,application/zip,application/x-zip-compressed" disabled={isUploading} aria-label="Select project zip file" className="sr-only"
                onChange={toCheckFile}
                ref={fileInputRef}
              />
            </label>
            <FieldDescription>
              Upload your project as a .zip file.
            </FieldDescription>
          </Field>
          <div className="grid xl:grid-cols-2 w-full gap-5 mt-4 xl:mt-5">
            <div>
              <Field className="mb-4 md:mb-0">
                <FieldLabel htmlFor="input-service-name">
                  Service Name
                </FieldLabel>
                <Input
                  id="input-service-name"
                  type="text"
                  className="h-11 shadow-none"
                  placeholder="Enter Your Service Name"
                  value={serviceName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setServiceName(e.target.value);
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === " ") {
                      e.preventDefault();
                    }
                  }}
                />
                <FieldDescription>
                  Specify only one HTTP service from your docker-compose to
                  expose to your domain.
                </FieldDescription>
              </Field>
            </div>
            <div>
              <Field className="mb-4 md:mb-0">
                <FieldLabel htmlFor="input-port">Port</FieldLabel>
                <Input
                  id="input-port"
                  type="text"
                  className="h-11 shadow-none"
                  placeholder="Enter Port Number"
                  value={port}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPort(e.target.value);
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === " ") {
                      e.preventDefault();
                    }
                  }}
                />
                <FieldDescription>
                  The internal port your service listens on (e.g., 3000 for
                  Node.js, 80 for Nginx).
                </FieldDescription>
              </Field>
            </div>
            <div>
              <Field className="mb-4 md:mb-0">
                <FieldLabel htmlFor="input-group-url">Domain Name</FieldLabel>
                <InputGroup className="h-11 shadow-none">
                  <InputGroupInput
                    id="input-group-url"
                    placeholder="example"
                    className="w-full h-full shadow-none !pl-15 !pr-20"
                    value={domain}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setDomain(e.target.value);
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === " ") {
                        e.preventDefault();
                      }
                    }}
                  />
                  <InputGroupAddon
                    align="inline-start"
                    className="font-[400] bg-transparent absolute left-0 pointer-events-none"
                  >
                    <InputGroupText>https://</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupAddon
                    align="inline-end"
                    className="font-[400] bg-transparent absolute right-0 pointer-events-none"
                  >
                    <InputGroupText>.addp.site</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription>
                  Choose a unique subdomain. Your app will be deployed to this
                  .addp.site address.
                </FieldDescription>
              </Field>
            </div>
            <div className="h-auto">
              <Field className="mb-4 md:mb-0">
                <FieldLabel htmlFor="input-deployment-action">
                  Deployment Action
                </FieldLabel>
                <div className="relative w-full">
                  <Select
                    onValueChange={(value) => {
                      setUploadType(value);
                    }}
                  >
                    <SelectTrigger
                      className="w-full !h-11 shadow-none"
                      id="input-deployment-action"
                    >
                      <SelectValue placeholder="Choose an option" />
                    </SelectTrigger>

                    <SelectContent position="popper" sideOffset={4}>
                      <SelectGroup>
                        <SelectLabel>Deployment Type</SelectLabel>
                        <SelectItem value="deploy">Deploy</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <FieldDescription className="flex items-start justify-start gap-2">
                  <HoverCard openDelay={10} closeDelay={200}>
                    <HoverCardTrigger asChild>
                      <span className="bg-transparent text-black dark:text-white flex justify-center items-center rounded-lg transition duration-200">
                        <CircleQuestionMark className="w-5 h-5" />
                      </span>
                    </HoverCardTrigger>
                    <HoverCardContent
                      className="flex w-75 flex-col gap-3"
                      side="right"
                    >
                      <div className="w-full flex flex-col gap-2">
                        <div className="font-[600] text-md">
                          Deploy (New Project)
                        </div>
                        <div className="text-sm font-[300]">
                          Select this to launch a brand-new application. A new
                          container will be created.
                        </div>
                      </div>
                      <div className="w-full flex flex-col gap-2">
                        <div className="font-[600] text-md">
                          Update (Existing Project)
                        </div>
                        <div className="text-sm font-[300]">
                          To deploy new code to a running app. <br />
                          <span className="text-amber-500">
                            *Must use the exact same Service Name, Port, and
                            Domain. Only change the .zip file.
                          </span>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  Select Deploy for a new project, or Update for an existing
                  one.
                </FieldDescription>
              </Field>
            </div>
          </div>
          <div className="w-full mt-6 flex justify-end">
            <Button
              form="form-upload"
              disabled={isUploading}
              type="submit"
              className="group h-11 w-full gap-2 rounded-lg sm:w-auto sm:px-6"
            >
              <CloudUpload className="size-4 transition duration-200 motion-safe:group-hover:-translate-y-1" />
              {isUploading ? <><LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" /> Uploading...</> : "Upload & Deploy"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  </MotionSurface>;
};
export default ComponentUploads;
