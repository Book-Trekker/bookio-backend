import { Model } from 'mongoose'

export type IUser = {
  name: string
  email: string
  phoneNumber: string
  address: string
  password: string
  role: string
  budget: number
  income: number
  shopName: string
}

export type IUserProfile = {
  name: string
  phoneNumber: string
  address: string
}

export type UserModel = {
  isUserExist(
    phoneNumber: string
  ): Promise<Pick<IUser, 'phoneNumber' | 'password' | 'role'>>
  isPasswordMatched(
    givenPassword: string,
    savedPassword: string
  ): Promise<boolean>
} & Model<IUser>
