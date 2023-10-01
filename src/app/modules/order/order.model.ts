import { Schema, model } from 'mongoose'
import { IOrder } from './order.interface'

// Creating a order schema
const orderSchema = new Schema<IOrder>(
  {
    books: [
      {
        bookId: { type: Schema.Types.ObjectId, required: true, ref: 'Book' },
      },
    ],
    buyer: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    quantity: { type: Number },
    orderNo: { type: Number },
  },
  { timestamps: true }
)

const Order = model<IOrder>('orders', orderSchema)
export default Order
