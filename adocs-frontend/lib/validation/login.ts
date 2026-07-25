import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "Username or Email is required." })
    .regex(/^[a-zA-Z0-9@.]+$/, {
      message: "Special characters not allowed.",
    }),

  password: z.string().min(1, { message: "Password is required." }),
});
