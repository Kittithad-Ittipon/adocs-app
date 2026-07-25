import { z } from "zod";

export const forgotSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "Username or Email is required." })
    .regex(/^[a-zA-Z0-9@.]+$/, {
      message: "Special characters not allowed.",
    }),
});
