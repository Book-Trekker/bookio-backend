import { Model } from 'mongoose'

export type IUser = {
  password: string
  needsPasswordChange: true | false
  role: string
  name: {
    firstName: string
    lastName: string
  }
  phoneNumber: string
  address: string
  budget: number
  income: number
}

export type IUserProfile = {
  name: {
    firstName: string
    lastName: string
  }
  phoneNumber: string
  address: string
}

export type UserModel = {
  isUserExist(
    phoneNumber: string
  ): Promise<
    Pick<IUser, 'phoneNumber' | 'password' | 'role' | 'needsPasswordChange'>
  >
  isPasswordMatched(
    givenPassword: string,
    savedPassword: string
  ): Promise<boolean>
} & Model<IUser>
