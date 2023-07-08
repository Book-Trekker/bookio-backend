import { z } from 'zod'

const orderValidationSchema = z.object({
  body: z.object({
    cow: z.string().nonempty('Cow is required'),
    buyer: z.string().nonempty('Buyer is required'),
  }),
})

export const orderValidation = {
  orderValidationSchema,
}
