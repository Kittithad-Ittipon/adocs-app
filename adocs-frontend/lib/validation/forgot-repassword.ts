import { z } from "zod";

export const forgotRePasswordSchema = z.object({
  otpValue: z
    .string()
    .trim()
    .min(1, { message: "OTP is required." })
    .regex(/^[0-9]+$/, {
      message: "OTP number only.",
    }),
  password: z.string().min(8, { message: "Password minimum 8 characters." }),
});
