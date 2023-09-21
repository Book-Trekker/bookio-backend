import httpStatus from 'http-status'
import { Secret } from 'jsonwebtoken'
import ApiError from '../../../errors/ApiError'
import { User } from '../user/user.model'
import {
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
} from './auth.interface'
import { jwtHelpers } from '../../../helpers/jwtHelper'
import config from '../../../config/config'

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { phoneNumber, password } = payload

  // Convert phoneNumber to string and check if it's an email
  const phoneNumberString = phoneNumber.toString()

  let isUserExist
  if (phoneNumberString.includes('@')) {
    isUserExist = await User.findOne({ email: phoneNumberString }).select(
      '+password'
    )
  } else {
    isUserExist = await User.findOne({ phoneNumber: phoneNumberString }).select(
      '+password'
    )
  }

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }

  console.log(isUserExist)

  if (
    isUserExist.password &&
    !(await User.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect')
  }

  const { phoneNumber: userPhoneNumber, role } = isUserExist
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
  }
}

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
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

  const isUserExist = await User.isUserExist(userPhoneNumber)
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }

  const newAccessToken = jwtHelpers.createToken(
    {
      phoneNumber: isUserExist.phoneNumber,
      role: isUserExist.role,
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  )

  return {
    accessToken: newAccessToken,
  }
}

export const AuthService = {
  loginUser,
  refreshToken,
}
