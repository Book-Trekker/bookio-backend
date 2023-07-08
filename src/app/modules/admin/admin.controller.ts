import { Request, RequestHandler, Response } from 'express'
import catchAsync from '../../../shared/catchAsync'
import { adminService } from './admin.service'
import sendResponse from '../../../shared/sendResponse'
import { IAdmin } from './admin.interface'
import httpStatus from 'http-status'

// create a new admin
const createAdmin: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...adminData } = req.body
    const result = await adminService.createAdmin(adminData)

    

    sendResponse<IAdmin>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Admin created successfully!',
      data: result,
    })
  }
)

export const adminController = {
  createAdmin,
}
