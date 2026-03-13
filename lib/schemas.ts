import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z
  .object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
    education: z.string().min(2, "Pendidikan wajib diisi"),
    schoolOrigin: z.string().min(2, "Asal sekolah wajib diisi"),
    examPurpose: z.enum(["ukai", "cpns", "pppk", "other"]),
    address: z.string().min(5, "Alamat minimal 5 karakter"),
    phone: z.string().min(8, "Nomor HP minimal 8 digit"),
    targetScore: z.coerce
      .number()
      .min(0, "Target skor tidak valid")
      .max(100, "Target skor maksimal 100"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

export const generateUserSchema = z.object({
  count: z.number().min(1).max(100),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type GenerateUserFormData = z.infer<typeof generateUserSchema>;
