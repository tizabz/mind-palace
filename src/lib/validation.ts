import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("email is not valid"),
  password: z.string().min(6,"password is not valid" ),
});

export const registerSchema = z.object({
  name: z.string().min(3, "Name must have at least 3 characters"),
  email: z.string().email("email is not valid"),
  password: z.string().min(8, "password must have at least 8 characters"),
});