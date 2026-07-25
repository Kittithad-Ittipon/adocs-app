import { z } from "zod";

export const usersSchema = z.object({
  maxContainers: z
    .string()
    .trim()
    .min(1, { message: "Max containers is required." })
    .regex(/^[\d]+$/, {
      message: "Max containers must be a number.",
    })
    .refine((port) => parseInt(port) >= 5 && parseInt(port) <= 10, {
      message: "Max containers must be between 5 and 10.",
    }),
  userName: z.string().trim(),
  useDB: z.boolean(),
});
