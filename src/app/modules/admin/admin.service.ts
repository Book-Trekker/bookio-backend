import httpStatus from 'http-status'
import ApiError from '../../../errors/ApiError'
import { IAdmin } from './admin.interface'
import { Admin } from './admin.model'
import { User } from '../user/user.model'

const createAdmin = async (payload: IAdmin): Promise<IAdmin> => {
  try {
    // Check duplicate entries
    const existingAdmin = await Admin.findOne({
      phoneNumber: payload.phoneNumber,
    })
    const existingUser = await User.findOne({
      phoneNumber: payload.phoneNumber,
    })
    if (existingAdmin || existingUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Phone Number already exists')
    }
    const createAdmin = await Admin.create(payload)
    return createAdmin
  } catch (error) {
    throw error
  }
}

export const adminService = { createAdmin }
