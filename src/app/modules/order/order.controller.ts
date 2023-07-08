import { Request, RequestHandler, Response } from 'express'
import catchAsync from '../../../shared/catchAsync'
import { OrderService } from './order.service'
import sendResponse from '../../../shared/sendResponse'
import { IOrder } from './order.interface'
import httpStatus from 'http-status'
import ApiError from '../../../errors/ApiError'
import { jwtHelpers } from '../../../helpers/jwtHelper'
import { Secret } from 'jsonwebtoken'
import config from '../../../config/config'

const createOrder: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...orderData } = req.body
    const token = req.headers.authorization
    let verifiedToken = null
    verifiedToken = jwtHelpers.verifyToken(
      token as string,
      config.jwt.secret as Secret
    )
    const { userPhoneNumber, role } = verifiedToken

    const result = await OrderService.createOrder(
      orderData,
      userPhoneNumber,
      role
    )

    sendResponse<IOrder>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Cow purchase successful!',
      data: result,
    })
  }
)

const getAllOrders: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const token = req.headers.authorization
    const orders = await OrderService.getOrders(token as string)

    sendResponse<IOrder[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Orders retrieved successfully!',
      data: orders,
    })
  }
)

const getSingleOrder: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id
    const token = req.headers.authorization
    const cow = await OrderService.getSingleOrder(id, token as string)

    if (!cow) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Order not found')
    }

    sendResponse<IOrder>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order retrieved successfully!',
      data: cow,
    })
  }
)

export const OrderController = {
  createOrder,
  getAllOrders,
  getSingleOrder,
}
