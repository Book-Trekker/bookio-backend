import { Request, RequestHandler, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { ICartItem } from './cart.interface'
import { CartService } from './cart.service'
import CartItem from './cart.model'

// Add a book to the cart (without authentication)
const addToCart: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { bookId, quantity, userId } = req.body

    const cartItem: ICartItem = {
      userId,
      bookId,
      quantity: quantity || 1,
    }

    await CartService.addToCart(cartItem)

    const savedCartItem = await CartItem.findOne({ userId, bookId })
      .populate('userId')
      .populate('bookId')
      .exec()

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Book added to cart successfully!',
      data: savedCartItem,
    })
  }
)

const getUsersCart: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const cart = await CartService.getUsersCart()

    sendResponse<ICartItem[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Users Cart retrieved successfully!',
      data: cart,
    })
  }
)

const deleteUserCart: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id
    await CartService.deleteUserCart(id)

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User deleted successfully!',
    })
  }
)

export const CartController = {
  addToCart,
  getUsersCart,
  deleteUserCart
}
