import { Types } from 'mongoose'
import { ICow } from '../book/book.interface'
import { IUser } from '../user/user.interface'

export type IOrder = {
  cow?: Types.ObjectId | ICow
  buyer?: Types.ObjectId | IUser
}
