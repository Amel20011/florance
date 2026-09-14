import { z } from 'zod';

export const sendOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Alamat email wajib diisi.')
    .email('Format alamat email tidak valid (contoh: user@gmail.com).')
    .max(254, 'Panjang email melebihi batas yang diizinkan.'),
});

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Alamat email wajib diisi.')
    .email('Format alamat email tidak valid.')
    .max(254, 'Panjang email melebihi batas yang diizinkan.'),
  otp: z
    .string()
    .trim()
    .min(1, 'Kode OTP wajib diisi.')
    .regex(/^\d{6}$/, 'Kode OTP harus berupa 6 digit angka.'),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

