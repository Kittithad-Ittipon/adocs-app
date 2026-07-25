import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "Username is required." })
    .regex(/^[a-zA-Z0-9]+$/, {
      message: "Username Special characters not allowed.",
    })
    .max(15, { message: "Username maximun 15 characters" }),
  email: z
    .email({ message: "Invalid email format." })
    .trim()
    .min(1, { message: "Email is required." }),
  password: z
    .string()
    .trim()
    .min(8, { message: "Password minimum 8 characters." }),
  dbState: z.boolean(),
});
