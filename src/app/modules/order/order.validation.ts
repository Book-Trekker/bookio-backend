import { z } from 'zod'

const orderValidationSchema = z.object({
  body: z.object({
    book: z.string().nonempty('Book is required'),
    buyer: z.string().nonempty('Buyer is required'),
    quantity: z.number().optional(),
  }),
})

export const orderValidation = {
  orderValidationSchema,
}
