import { Schema, model } from 'mongoose'
import { IOrder } from './order.interface'

// Creating a order schema
const orderSchema = new Schema<IOrder>(
  {
    cow: { type: Schema.Types.ObjectId, required: true, ref: 'Cow' },
    buyer: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
)

const Order = model<IOrder>('orders', orderSchema)
export default Order
