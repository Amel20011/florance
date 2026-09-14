import { z } from 'zod';

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(10, 'Nomor WhatsApp minimal 10 digit.')
    .max(20, 'Nomor WhatsApp terlalu panjang.')
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, 'Format nomor WhatsApp tidak valid (contoh: 08123456789).'),
});

export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(10, 'Nomor WhatsApp minimal 10 digit.')
    .max(20, 'Nomor WhatsApp terlalu panjang.'),
  otp: z
    .string()
    .trim()
    .min(1, 'Kode OTP wajib diisi.')
    .regex(/^\d{6}$/, 'Kode OTP harus berupa 6 digit angka.'),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
