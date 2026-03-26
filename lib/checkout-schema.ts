import { z } from 'zod/v4';

export const checkoutSchema = z.object({
  // Shipping Address
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Invalid email address'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[\d\s\-+()]+$/, 'Invalid phone number'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z
    .string()
    .min(1, 'ZIP code is required')
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code (e.g. 12345)'),

  // Payment
  cardNumber: z
    .string()
    .min(1, 'Card number is required')
    .regex(/^[\d\s]{13,19}$/, 'Invalid card number'),
  cardName: z.string().min(1, 'Name on card is required'),
  expiryDate: z
    .string()
    .min(1, 'Expiry date is required')
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid format (MM/YY)'),
  cvv: z
    .string()
    .min(1, 'CVV is required')
    .regex(/^\d{3,4}$/, 'Invalid CVV'),

  // Billing Address
  billingAddress: z.string().min(1, 'Billing address is required'),
  billingCity: z.string().min(1, 'City is required'),
  billingState: z.string().min(1, 'State is required'),
  billingZipCode: z
    .string()
    .min(1, 'ZIP code is required')
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code (e.g. 12345)'),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
