import { z } from 'zod';

export const verificationChannelSchema = z.enum(['whatsapp', 'email']);

export const genderSchema = z.enum(['male', 'female']);

export const step1AccountSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(6),
  channel: verificationChannelSchema,
});

export const step2PersonalSchema = z.object({
  gender: genderSchema,
  birthDate: z.string().min(1),
  address: z.string().min(1),
});

export const step3ProfessionalSchema = z.object({
  specialty: z.string().min(1),
  licenseNumber: z.string().min(1),
  qualification: z.string().min(1),
  clinicAddress: z.string().min(1),
  bio: z.string().min(1),
});

export const step4AdditionalSchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
});

export const signUpSchema = step1AccountSchema
  .and(step2PersonalSchema)
  .and(step3ProfessionalSchema)
  .and(step4AdditionalSchema);

export type Step1AccountValues = z.infer<typeof step1AccountSchema>;
export type Step2PersonalValues = z.infer<typeof step2PersonalSchema>;
export type Step3ProfessionalValues = z.infer<typeof step3ProfessionalSchema>;
export type Step4AdditionalValues = z.infer<typeof step4AdditionalSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
