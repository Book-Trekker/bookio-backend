import { Model } from 'mongoose'

export type IUser = {
  name: string
  email: string
  phoneNumber: number
  address: string
  password: string
  role: string
  budget: number
  income: number
}

export type IUserProfile = {
  name: string
  phoneNumber: number
  address: string
}

export type UserModel = {
  isUserExist(
    phoneNumber: number
  ): Promise<
    Pick<IUser, 'phoneNumber' | 'password' | 'role'>
  >
  isPasswordMatched(
    givenPassword: string,
    savedPassword: string
  ): Promise<boolean>
} & Model<IUser>
