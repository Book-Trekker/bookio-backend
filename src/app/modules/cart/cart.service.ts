import httpStatus from 'http-status'
import ApiError from '../../../errors/ApiError'
import CartItem from './cart.model'
import { ICartItem } from './cart.interface'

const addToCart = async (cartItem: ICartItem): Promise<void> => {
  try {
    const { userId, bookId, quantity } = cartItem

    // Check if 'quantity' is defined and a positive number
    if (
      quantity === undefined ||
      typeof quantity !== 'number' ||
      quantity <= 0
    ) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid quantity provided')
    }

    // Check if the book is already in the user's cart
    let existingCartItem = await CartItem.findOne({ userId, bookId })

    if (existingCartItem) {
      if (existingCartItem.quantity !== undefined) {
        existingCartItem.quantity += quantity
      } else {
        existingCartItem.quantity = quantity
      }
      await existingCartItem.save()
    } else {
      existingCartItem = new CartItem(cartItem)
      await existingCartItem.save()
    }
    await existingCartItem.populate('userId')
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error adding to cart')
  }
}

export const CartService = {
  addToCart,
}
