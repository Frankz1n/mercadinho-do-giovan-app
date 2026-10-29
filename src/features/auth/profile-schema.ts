import { z } from 'zod';

export const profileNameSchema = z
  .string()
  .trim()
  .min(2, 'Informe seu nome completo.')
  .max(120, 'Nome muito longo.');

export const profilePhoneSchema = z
  .string()
  .trim()
  .refine((value) => value.replace(/\D/g, '').length >= 10, {
    message: 'Informe um WhatsApp válido com DDD.',
  })
  .refine((value) => value.length <= 20, {
    message: 'Telefone muito longo.',
  });

export const profileDetailsSchema = z.object({
  name: profileNameSchema,
  phone: profilePhoneSchema,
});
