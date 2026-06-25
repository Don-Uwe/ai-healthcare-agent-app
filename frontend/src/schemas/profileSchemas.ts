import * as z from 'zod';

export const generalSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  userHandle: z.string().min(1, 'User handle is required'),
  email: z.string().email('Please enter a valid email'),
  about: z.string().min(1, 'About is required'),
});

export type GeneralFormData = z.infer<typeof generalSchema>;

export const contactSchema = z.object({
  phone_number: z.string().min(10, 'Please enter a valid phone number'),
  contact_email: z.string().email('Please enter a valid email'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const profSchema = z.object({
  specialization: z.string().min(1, 'Specialization is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  experience: z.string().min(1, 'Experience is required'),
});

export type ProfFormData = z.infer<typeof profSchema>;

export const passwordSchema = z.object({
  old_password: z.string().min(1, 'Old password is required'),
  new_password: z.string()
    .min(6, 'At least 6 characters')
    .regex(/(?=.*[a-z]).{6,}/, 'At least 6 characters with lowercase letter'),
  confirm_password: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
}).refine((data) => data.new_password !== data.old_password, {
  message: "New password must be different from old password",
  path: ['new_password'],
});

export type PasswordFormData = z.infer<typeof passwordSchema>;
