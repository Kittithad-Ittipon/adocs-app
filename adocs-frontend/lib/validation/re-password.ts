import { z } from "zod";

export const rePasswordSchema = z.object({
  password: z.string().min(8, { message: "Password minimum 8 characters." }),
  newPassword: z.string().min(8, { message: "Password minimum 8 characters." }),
});
