import { Request, Response } from 'express'
import { RequestHandler } from 'express-serve-static-core'
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { IUser, IUserProfile } from './user.interface'
import { userService } from './user.service'
import ApiError from '../../../errors/ApiError'
import { jwtHelpers } from '../../../helpers/jwtHelper'
import config from '../../../config/config'
import { Secret } from 'jsonwebtoken'
import { IAdmin } from '../admin/admin.interface'

// create a new user
const createUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...userData } = req.body
    const result = await userService.createNewUser(userData)

    sendResponse<IUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User created successfully!',
      data: result,
    })
  }
)

// get all users
const getAllUsers: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const users = await userService.getAllUsers()

    sendResponse<IUser[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'All users retrieved successfully!',
      data: users,
    })
  }
)

// get single user
const getSingleUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.id
    const user = await userService.getSingleUser(userId)

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
    }

    sendResponse<IUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User retrieved successfully!',
      data: user,
    })
  }
)

// delete user
const deleteUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id
    await userService.deleteUser(id)

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User deleted successfully!',
    })
  }
)

// update user
const updateUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id
    const updateData = req.body
    const updatedUser = await userService.updateUser(id, updateData)

    if (!updatedUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
    }

    sendResponse<IUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User updated successfully!',
      data: updatedUser,
    })
  }
)

// get user profile
const getUserProfile: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const token = req.headers.authorization

    let verifiedToken = null
    try {
      verifiedToken = jwtHelpers.verifyToken(
        token as string,
        config.jwt.secret as Secret
      )
    } catch (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid access token')
    }

    const { userPhoneNumber, role } = verifiedToken

    // Match the userPhoneNumber and role with the User collection
    const user = await userService.getUserProfile(userPhoneNumber, role)

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
    }

    // Extract only the required fields from the user object
    // const userProfile: IUserProfile = {
    //   name: user.name,
    //   phoneNumber: user.phoneNumber,
    //   address: user.address,
    // }

    sendResponse<IUser | IAdmin>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User's information retrieved successfully",
      data: user,
    })
  }
)

// update profile

const updateUserProfile: RequestHandler = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization;

  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token as string,
      config.jwt.secret as Secret
    );
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid access token');
  }

  const { userPhoneNumber, role } = verifiedToken;
  const updateData = req.body;

  const updatedUser = await userService.updateUserProfile(userPhoneNumber, role, updateData);

  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Extract only the required fields from the updatedUser object
  const userProfile: IUserProfile = {
    name: updatedUser.name,
    phoneNumber: updatedUser.phoneNumber,
    address: updatedUser.address,
  };

  sendResponse<IUserProfile>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile updated successfully!',
    data: userProfile,
  });
});

export const UserController = {
  createUser,
  getAllUsers,
  getSingleUser,
  deleteUser,
  updateUser,
  getUserProfile,
  updateUserProfile
}
