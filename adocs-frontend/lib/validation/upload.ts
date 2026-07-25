import z from "zod";

export const uploadsSchema = z.object({
  file: z
    .instanceof(File, { message: "Please upload a valid file." })
    .refine((file) => file.name.endsWith(".zip"), {
      message: "Only .zip files are allowed.",
    })
    .refine(
      (file) =>
        file.type === "application/zip" ||
        file.type === "application/x-zip-compressed",
      { message: "Invalid zip format." },
    ),
  serviceName: z
    .string()
    .trim()
    .min(1, { message: "Service Name is required." })
    .max(25, { message: "Service Name must be less than 25 characters." })
    .refine((service) => service === service.toLowerCase(), {
      message: "Service Name must be in lowercase.",
    })
    .regex(/^[a-z0-9-]+$/, {
      message: "Service Name contains special characters not allowed.",
    })
    .refine((service) => !service.startsWith("-") && !service.endsWith("-"), {
      message: "Service Name must not start or end with a dash (-).",
    }),
  port: z
    .string()
    .trim()
    .min(1, { message: "Port is required." })
    .regex(/^[\d]+$/, {
      message: "Port must be a number.",
    })
    .refine((port) => parseInt(port) > 0 && parseInt(port) < 65536, {
      message: "Port number must be between 1 and 65535.",
    })
    .max(5, { message: "Port number must be less than 65536." }),
  domain: z
    .string()
    .trim()
    .min(1, { message: "Domain is required." })
    .max(30, { message: "Domain must be less than 30 characters." })
    .refine((domain) => domain === domain.toLowerCase(), {
      message: "Domain must be in lowercase.",
    })
    .refine((domain) => !domain.includes(" "), {
      message: "Domain must not contain spaces.",
    })
    .regex(/^[a-z0-9.-]+$/, {
      message: "Domain contains special characters not allowed.",
    })
    .refine((domain) => !domain.startsWith("-") && !domain.startsWith("."), {
      message: "Domain must not start with a dash (-) or a dot (.).",
    })
    .refine((domain) => !domain.endsWith("-") && !domain.endsWith("."), {
      message: "Domain must not end with a dash (-) or a dot (.).",
    })
    .refine((domain) => !/--|\.\.|-\.|\.-/.test(domain), {
      message:
        "Domain contains invalid character sequences (like '--' or '..').",
    })
    .refine((domain) => domain !== "addp.site", {
      message: "Domain name 'addp.site' is not allowed.",
    })
    .refine((domain) => !domain.endsWith(".addp.site"), {
      message: "Domain ending with '.addp.site' is not allowed.",
    }),
  uploadType: z
    .string()
    .trim()
    .refine((value) => value === "deploy" || value === "update", {
      message: "Invalid upload type. Must be 'Deploy' or 'Update'.",
    }),
});
