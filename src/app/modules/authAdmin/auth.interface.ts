import { ENUM_USER_ROLE } from '../../../enums/user'

export type ILoginAdmin = {
  phoneNumber: string
  password: string
}

export type ILoginAdminResponse = {
  accessToken: string
  refreshToken?: string
  needsPasswordChange: boolean
}

export type IRefreshTokenResponse = {
  accessToken: string
}

export type IVerifiedLoginAdmin = {
  userId: string
  role: ENUM_USER_ROLE
}
