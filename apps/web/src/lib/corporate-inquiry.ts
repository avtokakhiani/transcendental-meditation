import { z } from 'zod';

export const corporateContactMethods = ['ორივე ფორმა მისაღებია', 'ელფოსტით', 'ტელეფონით'] as const;

export const corporateInquirySchema = z.object({
  name: z.string().trim().min(1).max(150),
  organization: z.string().trim().min(1).max(200),
  email: z.email().max(254),
  phone: z.string().trim().max(40).refine(value => !value || /^[+\d\s().-]{5,40}$/.test(value)),
  contactMethod: z.enum(corporateContactMethods),
  message: z.string().trim().max(5000),
  website: z.string().max(200),
  startedAt: z.number().int().positive(),
}).refine(value => value.contactMethod !== 'ტელეფონით' || value.phone.replace(/\D/g, '').length >= 5, { path: ['phone'] });

export const corporateDeliveryError = 'მოთხოვნა ვერ გაიგზავნა. გთხოვთ, სცადოთ მოგვიანებით.';
