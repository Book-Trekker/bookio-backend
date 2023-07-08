import { Model } from 'mongoose'

export type IAdmin = {
  role: string
  name: {
    firstName: string
    lastName: string
  }
  password: string
  needsPasswordChange: boolean
  phoneNumber: string
  address: string
}

export type AdminModel = {
  isAdminExist(
    phoneNumber: string
  ): Promise<
    Pick<IAdmin, 'phoneNumber' | 'password' | 'role' | 'needsPasswordChange'>
  >
  isPasswordMatched(
    givenPassword: string,
    savedPassword: string
  ): Promise<boolean>
} & Model<IAdmin>
