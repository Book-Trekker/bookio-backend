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

export const CartController = {
  addToCart,
}
