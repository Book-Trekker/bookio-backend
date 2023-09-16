import httpStatus from 'http-status'
import ApiError from '../../../errors/ApiError'
import CartItem from './wishlist.model'
import { ICartItem } from './wishlist.interface'
import WishList from './wishlist.model'

const addToWishList = async (cartItem: ICartItem): Promise<void> => {
  try {
    const { userId, bookId } = cartItem

    // Check if the book is already in the user's wishlist
    const existingWishListItem = await WishList.findOne({ userId, bookId })

    if (existingWishListItem) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'This item is already in your wishlist'
      )
    } else {
      const newWishListItem = new WishList(cartItem)
      await newWishListItem.save()
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    } else {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Error adding to wishlist'
      )
    }
  }
}

const getWishListCart = async (): Promise<ICartItem[]> => {
  try {
    const cart = await WishList.find()
      .populate('userId')
      .populate('bookId')
      .exec()
    return cart
  } catch (error) {
    throw error
  }
}

const deleteWishListCart = async (id: string): Promise<void> => {
  try {
    const wishlist = await WishList.findByIdAndDelete(id)
    if (!wishlist) {
      throw new Error('Item not found')
    }
  } catch (error) {
    throw error
  }
}

export const WishListService = {
  addToWishList,
  deleteWishListCart,
  getWishListCart,
}
