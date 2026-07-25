"use client";

import {
  CircleCheck,
  CircleQuestionMark,
  CircleX,
  CloudUpload,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import React, { useRef, useState } from "react";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { pollCeleryTask } from "@/lib/task-check";

const ComponentUploads = () => {
  const [file, setFile] = useState<File | null>(null);
  const [serviceName, setServiceName] = useState<string>("");
  const [port, setPort] = useState<string>("");
  const [domain, setDomain] = useState<string>("");
  const [uploadType, setUploadType] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toCheckFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
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
    const isSuccess = await pollCeleryTask(
      data.taskID,
      `Deploy '${serviceName}' Successfully`,
      `Deploy '${serviceName}' Failed `,
    );
  };
  return (
    <div className="max-w-screen min-h-full flex items-center justify-start flex-col">
      <Breadcrumb className="w-full justify-center items-center mt-10 md:mt-2 md:px-9 md:py-5">
        <BreadcrumbList className="w-full h-full text-md xl:text-lg font-[600] justify-center mb-4 sm:mb-0 md:justify-start items-center">
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-gray-400">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-[600]">Uploads</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full min-h-[750px] p-4 md:px-8 overflow-hidden">
        <form
          action="#"
          id="form-upload"
          onSubmit={uploadProject}
          className="w-full h-full flex flex-col justify-start items-center"
        >
          <Field className="mb-4 md:mb-0">
            <FieldLabel htmlFor="input-service-name">File</FieldLabel>
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center w-full h-15 md:h-65 border rounded-xl cursor-pointer group hover:bg-gray-50 dark:bg-input/30 transition duration-200"
            >
              {file && (
                <div className="flex md:flex-col gap-2 md:gap-0 md:justify-center items-center">
                  <CircleCheck className="md:w-18 md:h-18 md:mb-2 text-green-500" />
                  <p className="font-[500] truncate max-w-15 sm:max-w-150 py-2 text-start md:text-center">
                    {file.name}
                  </p>
                  <p className="font-[400] text-gray-500 truncate max-w-50 flex items-center justify-center">
                    {(file.size / 1024 / 1024).toFixed(3)} MB
                  </p>
                  <button
                    onClick={toCancelFile}
                    type="button"
                    className="text-red-400 hover:text-red-500 transition duration-200 flex items-center justify-center gap-1 underline md:mt-2 font-[500] cursor-pointer text-sm"
                  >
                    Remove File <CircleX className="w-4 h-4" />
                  </button>
                </div>
              )}
              {!file && (
                <div className="flex md:flex-col justify-center items-center gap-4 md:gap-0">
                  <CloudUpload className="w-5 h-5 md:w-15 md:h-15 md:mb-2 text-gray-400 group-hover:text-sky-500 dark:group-hover:text-cyan-300 group-hover:-translate-y-2 transition duration-200" />
                  <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 text-center transition duration-200 text-xs md:text-sm md:px-5 md:mt-3">
                    Click To Upload Project
                  </span>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                className="hidden"
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
                  className="h-15 shadow-none"
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
                  className="h-15 shadow-none"
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
                <InputGroup className="h-15 shadow-none">
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
                      className="w-full !h-15 shadow-none"
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
          <div className="w-full mt-10 justify-center items-center flex">
            <Button
              form="form-upload"
              type="submit"
              className="flex items-center w-1/1 xl:w-1/3 shadow-none h-15 rounded-xl bg-black/85 dark:bg-white dark:hover:bg-white/90 cursor-pointer group font-[600] text-md gap-3"
            >
              <CloudUpload className="!w-7 !h-7 transition duration-200 group-hover:-translate-y-1" />
              Upload & Deploy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ComponentUploads;
