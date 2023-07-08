import { z } from 'zod'

const adminSchema = z.object({
  body: z.object({
    role: z.string().refine((value) => value === 'admin', {
      message: 'Role must be "admin"',
    }),
    name: z.object({
      firstName: z.string({ required_error: 'First name is required' }),
      lastName: z.string({ required_error: 'Last name is required' }),
    }),
    password: z.string({ required_error: 'Password is required' }),
    phoneNumber: z.string({ required_error: 'Phone number is required' }),
    address: z.string({ required_error: 'Address is required' }),
  }),
})

export const AdminValidation = {
  adminSchema,
}
