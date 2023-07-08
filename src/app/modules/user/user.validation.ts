import { z } from 'zod'

const userValidationSchema = z.object({
  body: z.object({
    phoneNumber: z.string({
      required_error: 'Phone number is required',
    }),
    role: z.enum(['seller', 'buyer'], {
      required_error: 'Role is required and must be either "seller" or "buyer"',
    }),
    password: z.string({
      required_error: 'Password is required',
    }),
    name: z.object({
      firstName: z.string({
        required_error: 'First name is required',
      }),
      lastName: z.string({
        required_error: 'Last name is required',
      }),
    }),
    address: z.string({
      required_error: 'Address is required',
    }),
    budget: z.number().refine((val) => val >= 0, {
      message: 'Budget must be a non-negative number',
    }),
    income: z.number().refine((val) => val >= 0, {
      message: 'Income must be a non-negative number',
    }),
  }),
})

export const UserValidation = {
  userValidationSchema,
}
