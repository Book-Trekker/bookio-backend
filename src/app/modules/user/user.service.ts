import ApiError from '../../../errors/ApiError'
import { IUser } from './user.interface'
import httpStatus from 'http-status'
import { User } from './user.model'
import { IAdmin } from '../admin/admin.interface'
import { Admin } from '../admin/admin.model'

const createNewUser = async (payload: IUser): Promise<IUser> => {
  try {
    // Check budget & income fields for negativity
    const { budget, income } = payload

    if (budget < 0 || income < 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Budget and income must be non-negative'
      )
    }

    // Check duplicate entries
    const existingUser = await User.findOne({
      phoneNumber: payload.phoneNumber,
    })
    if (existingUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Phone Number already exists')
    }

    const createUser = await User.create(payload)
    return createUser
  } catch (error) {
    throw error
  }
}

const getAllUsers = async (): Promise<IUser[]> => {
  try {
    const users = await User.find()
    return users
  } catch (error) {
    throw error
  }
}

const getSingleUser = async (userId: string): Promise<IUser | null> => {
  try {
    const user = await User.findById(userId)
    return user
  } catch (error) {
    throw error
  }
}

const deleteUser = async (id: string): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(id)
    if (!user) {
      throw new Error('User not found')
    }
  } catch (error) {
    throw error
  }
}

const updateUser = async (
  id: string,
  payload: Partial<IUser>
): Promise<IUser | null> => {
  try {
    const user = await User.findByIdAndUpdate(id, payload, { new: true })
    return user
  } catch (error) {
    throw error
  }
}

const getUserProfile = async (
  userPhoneNumber: string,
  role: string
): Promise<IUser | IAdmin | null> => {
  try {
    const user = await User.findOne({
      phoneNumber: userPhoneNumber,
      role: role,
    })

    if (user) {
      return user
    }

    const admin = await Admin.findOne({
      phoneNumber: userPhoneNumber,
      role: role,
    })

    return admin
  } catch (error) {
    throw error
  }
}

// update user profile
const updateUserProfile = async (
  userPhoneNumber: string,
  role: string,
  updateData: Partial<IUser | IAdmin>
): Promise<IUser | IAdmin | null> => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      {
        phoneNumber: userPhoneNumber,
        role: role,
      },
      updateData,
      { new: true } // Return the updated user instead of the old one
    )

    if (updatedUser) {
      return updatedUser
    }
    const updatedAdmin = await Admin.findOneAndUpdate(
      {
        phoneNumber: userPhoneNumber,
        role: role,
      },
      updateData,
      { new: true } // Return the updated user instead of the old one
    )
    return updatedAdmin
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNewUser,
  getAllUsers,
  getSingleUser,
  deleteUser,
  updateUser,
  getUserProfile,
  updateUserProfile,
}
