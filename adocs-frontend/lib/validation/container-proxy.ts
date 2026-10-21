import { z } from "zod";

// Only a subdomain joins the deploy proxy host (npm_id), proxyId targets another host, port and protocol create a new one.
export const containerProxySchema = z
  .object({
    subdomain: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, { message: "Subdomain is required." })
      .max(63, { message: "Subdomain must be 63 characters or fewer." })
      .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, {
        message: "Subdomain may only contain letters, numbers and hyphens, and cannot start or end with a hyphen.",
      }),
    proxyId: z.number().int().positive().optional(),
    port: z
      .string()
      .trim()
      .regex(/^[\d]+$/, {
        message: "Port must be a number.",
      })
      .refine((port) => parseInt(port) > 0 && parseInt(port) < 65536, {
        message: "Port number must be between 1 and 65535.",
      })
      .optional(),
    protocol: z
      .string()
      .trim()
      .refine((value) => value === "http" || value === "https", {
        message: "Invalid protocol. Must be 'http' or 'https'.",
      })
      .optional(),
  })
  .refine((value) => !value.port === !value.protocol, {
    message: "Port and protocol are both required for a new proxy host.",
  });
