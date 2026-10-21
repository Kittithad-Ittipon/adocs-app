"use client";
import LoadingLine from "@/components/feedback/LoadingLine";
import MotionSurface from "@/components/feedback/MotionSurface";
import { useLoadingTasks } from "@/components/feedback/useLoadingTasks";
import SystemPage from "@/components/system/shared/SystemPage";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { cn } from "@/lib/utils";
import { pollCeleryTask } from "@/lib/task-check";
import {
  CircleQuestionMark,
  CloudUpload,
  FileArchive,
  LoaderCircle,
  X,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
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
  const blockSpace = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") {
      e.preventDefault();
    }
  };
  return <MotionSurface className="w-full">
    <LoadingLine loading={isUploading} fixed label="Uploading project" />
    <SystemPage title="Upload project" description="Deploy a new project or update an existing application." className="[&_[data-slot=field-description]]:text-xs">
      <Card className="gap-0 py-0 shadow-none">
        <form action="#" id="form-upload" onSubmit={uploadProject}>
          <CardContent className="grid gap-6 p-4 sm:p-6 lg:grid-cols-2">
            <Field className="gap-2">
              <FieldLabel htmlFor="file-upload">Project file</FieldLabel>
              <label
                htmlFor="file-upload"
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
                onDrop={onDrop}
                className={cn(
                  "group relative flex min-h-48 w-full flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center focus-within:ring-2 focus-within:ring-ring motion-safe:transition-colors",
                  isUploading ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                  isDragging ? "border-foreground/40 bg-muted" : "hover:border-foreground/30 hover:bg-muted/40",
                )}
              >
                {file ? (
                  <>
                    <span className="flex size-10 items-center justify-center rounded-lg border"><FileArchive className="size-5 text-muted-foreground" aria-hidden="true" /></span>
                    <div className="min-w-0 space-y-0.5">
                      <p className="max-w-56 truncate text-sm font-medium sm:max-w-80">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(3)} MB</p>
                    </div>
                    <Button type="button" variant="ghost" size="xs" onClick={toCancelFile} disabled={isUploading} className="text-muted-foreground hover:text-destructive"><X aria-hidden="true" />Remove file</Button>
                  </>
                ) : (
                  <>
                    <span className="flex size-10 items-center justify-center rounded-lg border"><CloudUpload className="size-5 text-muted-foreground group-hover:text-foreground motion-safe:transition-colors" aria-hidden="true" /></span>
                    <p className="text-sm text-muted-foreground">{isDragging ? "Drop your .zip file here" : "Drag & drop your project, or click to browse"}</p>
                  </>
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
            <div className="grid content-start gap-5">
              <Field className="gap-2">
                <FieldLabel htmlFor="input-service-name">Service Name</FieldLabel>
                <Input
                  id="input-service-name"
                  type="text"
                  placeholder="Enter Your Service Name"
                  value={serviceName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setServiceName(e.target.value);
                  }}
                  onKeyDown={blockSpace}
                />
                <FieldDescription>
                  Specify only one HTTP service from your docker-compose to
                  expose to your domain.
                </FieldDescription>
              </Field>
              <Field className="gap-2">
                <FieldLabel htmlFor="input-port">Port</FieldLabel>
                <Input
                  id="input-port"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter Port Number"
                  value={port}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPort(e.target.value);
                  }}
                  onKeyDown={blockSpace}
                />
                <FieldDescription>
                  The internal port your service listens on (e.g., 3000 for
                  Node.js, 80 for Nginx).
                </FieldDescription>
              </Field>
              <Field className="gap-2">
                <FieldLabel htmlFor="input-group-url">Domain Name</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start"><InputGroupText>https://</InputGroupText></InputGroupAddon>
                  <InputGroupInput
                    id="input-group-url"
                    placeholder="example"
                    value={domain}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setDomain(e.target.value);
                    }}
                    onKeyDown={blockSpace}
                  />
                  <InputGroupAddon align="inline-end"><InputGroupText>.addp.site</InputGroupText></InputGroupAddon>
                </InputGroup>
                <FieldDescription>
                  Choose a unique subdomain. Your app will be deployed to this
                  .addp.site address.
                </FieldDescription>
              </Field>
              <Field className="gap-2">
                <div className="flex items-center gap-1.5">
                  <FieldLabel htmlFor="input-deployment-action">Deployment Action</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="ghost" size="icon-xs" className="text-muted-foreground" aria-label="About deployment actions"><CircleQuestionMark aria-hidden="true" /></Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-80 gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">Deploy (New Project)</p>
                        <p className="text-xs text-muted-foreground">
                          Select this to launch a brand-new application. A new
                          container will be created.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Update (Existing Project)</p>
                        <p className="text-xs text-muted-foreground">
                          To deploy new code to a running app.{" "}
                          <span className="text-amber-600 dark:text-amber-400">
                            *Must use the exact same Service Name, Port, and
                            Domain. Only change the .zip file.
                          </span>
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Select
                  onValueChange={(value) => {
                    setUploadType(value);
                  }}
                >
                  <SelectTrigger className="w-full" id="input-deployment-action">
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
                <FieldDescription>
                  Select Deploy for a new project, or Update for an existing
                  one.
                </FieldDescription>
              </Field>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t px-4 py-3 sm:px-6">
            <Button form="form-upload" disabled={isUploading} type="submit" className="w-full sm:w-auto">
              {isUploading ? <><LoaderCircle className="motion-safe:animate-spin" aria-hidden="true" /> Uploading...</> : <><CloudUpload aria-hidden="true" /> Upload & Deploy</>}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </SystemPage>
  </MotionSurface>;
};
export default ComponentUploads;
