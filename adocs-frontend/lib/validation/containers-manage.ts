import { z } from "zod";

export const containersSchema = z.object({
  port: z
    .string()
    .trim()
    .min(1, { message: "Port is required." })
    .regex(/^[\d]+$/, {
      message: "Port must be a number.",
    })
    .refine((port) => parseInt(port) > 0 && parseInt(port) < 65536, {
      message: "Port number must be between 1 and 65535.",
    }),
  containerName: z.string().trim(),
  protocol: z
    .string()
    .trim()
    .refine((value) => value === "http" || value === "https", {
      message: "Invalid protocol. Must be 'http' or 'https'.",
    }),
  publish: z.boolean(),
});
