import { Schema, model } from 'mongoose'
import { ICartItem } from './cart.interface'

// Creating a cart schema
const cartItemSchema = new Schema<ICartItem>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    bookId: {
      type: String,
      ref: 'Book',
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
)

const CartItem = model('CartItem', cartItemSchema)

export default CartItem
