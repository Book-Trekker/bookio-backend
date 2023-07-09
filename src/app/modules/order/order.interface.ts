import { Types } from 'mongoose'
import { IBook } from '../book/book.interface'
import { IUser } from '../user/user.interface'

export type IOrder = {
  book?: Types.ObjectId | IBook
  buyer?: Types.ObjectId | IUser
  quantity?: number
}
