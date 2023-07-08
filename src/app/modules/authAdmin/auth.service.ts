import httpStatus from 'http-status'
import { Secret } from 'jsonwebtoken'
import ApiError from '../../../errors/ApiError'
import { User } from '../user/user.model'
import {
  ILoginAdmin,
  ILoginAdminResponse,
  IRefreshTokenResponse,
} from './auth.interface'
import { jwtHelpers } from '../../../helpers/jwtHelper'
import config from '../../../config/config'
import { Admin } from '../admin/admin.model'

const loginUser = async (
  payload: ILoginAdmin
): Promise<ILoginAdminResponse> => {
  const { phoneNumber, password } = payload
  const isAdminExist = await Admin.isAdminExist(phoneNumber)

  if (!isAdminExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin does not exist')
  }

  if (
    isAdminExist.password &&
    !(await User.isPasswordMatched(password, isAdminExist.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect')
  }

  //create access token & refresh token

  const {
    phoneNumber: userPhoneNumber,
    role,
    needsPasswordChange,
  } = isAdminExist
  const accessToken = jwtHelpers.createToken(
    { userPhoneNumber, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  )

  const refreshToken = jwtHelpers.createToken(
    { userPhoneNumber, role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  )

  return {
    accessToken,
    refreshToken,
    needsPasswordChange,
  }
}

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  //verify token
  // invalid token - synchronous
  let verifiedToken = null
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret
    )
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Refresh Token')
  }

  const { userPhoneNumber } = verifiedToken

  // checking deleted user's refresh token

  const isAdminExist = await Admin.isAdminExist(userPhoneNumber)
  if (!isAdminExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin does not exist')
  }
  //generate new token

  const newAccessToken = jwtHelpers.createToken(
    {
      phoneNumber: isAdminExist.phoneNumber,
      role: isAdminExist.role,
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  )

  return {
    accessToken: newAccessToken,
  }
}

export const AdminAuthService = {
  loginUser,
  refreshToken,
}
