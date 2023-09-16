import { Request, RequestHandler, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { ICartItem } from './wishlist.interface'
import CartItem from './wishlist.model'
import { WishListService } from './wishlist.service'

// Add a book to the cart (without authentication)
const addToWishList: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { bookId, userId } = req.body

    const cartItem: ICartItem = {
      userId,
      bookId,
    }

    await WishListService.addToWishList(cartItem)

    const savedCartItem = await CartItem.findOne({ userId, bookId })
      .populate('userId')
      .populate('bookId')
      .exec()

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Product added to wishlist successfully!',
      data: savedCartItem,
    })
  }
)

const getWishListCart: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const cart = await WishListService.getWishListCart()

    sendResponse<ICartItem[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Users WishList retrieved successfully!',
      data: cart,
    })
  }
)

const deleteWishListCart: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id
    await WishListService.deleteWishListCart(id)

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Item deleted successfully!',
    })
  }
)

export const WishListController = {
  addToWishList,
  deleteWishListCart,
  getWishListCart,
}
