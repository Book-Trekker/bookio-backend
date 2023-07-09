import httpStatus from 'http-status'
import ApiError from '../../../errors/ApiError'
import { IOrder } from './order.interface'
import Order from './order.model'
import mongoose from 'mongoose'
import { User } from '../user/user.model'
import { jwtHelpers } from '../../../helpers/jwtHelper'
import config from '../../../config/config'
import { Secret } from 'jsonwebtoken'
import Book from '../book/book.model'

const createOrder = async (
  payload: IOrder,
  userPhoneNumber: string,
  role: string
): Promise<IOrder> => {
  try {
    const { book, buyer, quantity } = payload
    // check null or undefined for quantity
    if (quantity === undefined) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Quantity is required')
    }

    const existingBook = await Book.findById(book)
    if (!existingBook) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid book reference ID')
    }

    // Check if the book is in stock or stock out
    if (existingBook.quantity < quantity) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient book quantity')
    }

    // Verify the buyer ID using userPhoneNumber and role
    const existingBuyer = await User.findOne({
      _id: buyer,
      phoneNumber: userPhoneNumber,
      role: role,
    })
    if (!existingBuyer) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid buyer reference ID')
    }
    // check existing order
    const existingOrder = await Order.findOne(payload)
    if (existingOrder) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Already purchased this book')
    }

    const bookPrice = existingBook.price
    const buyerBudget = existingBuyer.budget
    const sellerId = existingBook.seller

    if (bookPrice * quantity > buyerBudget) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "You don't have sufficient funds to buy these books"
      )
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Deduct the book quantity & handle book status -> stock | stock out
      existingBook.quantity -= quantity
      if (existingBook.quantity === 0) {
        existingBook.status = 'stock out'
      }
      await existingBook.save()

      // Deduct book cost from the buyer's budget
      existingBuyer.budget -= bookPrice * quantity
      await existingBuyer.save()

      // Increase seller's income by the book cost
      const existingSeller = await User.findById(sellerId)
      if (!existingSeller) {
        throw new Error('Seller not found')
      }
      existingSeller.income += bookPrice * quantity
      await existingSeller.save()

      // Create the order
      const createdOrder = await Order.create(payload)
      const populatedOrder = await Order.findById(createdOrder._id)
        .populate('book')
        .populate('buyer')
        .populate({
          path: 'book',
          populate: {
            path: 'seller',
            model: 'User',
          },
        })

      await session.commitTransaction()
      session.endSession()

      if (!populatedOrder) {
        throw new Error('Failed to populate the created order')
      }

      return populatedOrder.toObject()
    } catch (error) {
      await session.abortTransaction()
      session.endSession()
      throw error
    }
  } catch (error) {
    throw error
  }
}

const getOrders = async (token: string): Promise<IOrder[]> => {
  let verifiedToken = null
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token as string,
      config.jwt.secret as Secret
    )
    const { userPhoneNumber, role } = verifiedToken

    let orders

    if (role === 'admin') {
      // If the role is "admin", retrieve all orders
      orders = await Order.find({})
        .populate('book')
        .populate('buyer')
        .populate({
          path: 'book',
          populate: {
            path: 'seller',
            model: 'User',
          },
        })
    } else if (role === 'buyer') {
      // If the role is "buyer", retrieve orders where the buyer's role and phoneNumber match
      const buyer = await User.findOne({
        role: 'buyer',
        phoneNumber: userPhoneNumber,
      })

      if (!buyer) {
        throw new Error('You are not a buyer')
      }

      orders = await Order.find({ buyer: buyer._id })
        .populate('book')
        .populate('buyer')
        .populate({
          path: 'book',
          populate: {
            path: 'seller',
            model: 'User',
          },
        })
    } else if (role === 'seller') {
      // If the role is "seller", retrieve orders where the book's seller's role and phoneNumber match
      const seller = await User.findOne({
        role: 'seller',
        phoneNumber: userPhoneNumber,
      })

      if (!seller) {
        throw new Error('You are not a seller')
      }

      orders = await Order.find({})
        .populate({
          path: 'book',
          match: { seller: seller._id },
          populate: {
            path: 'seller',
            model: 'User',
          },
        })
        .populate('buyer')
    } else {
      throw new Error('Invalid user role')
    }

    return orders
  } catch (error) {
    throw error
  }
}

const getSingleOrder = async (
  id: string,
  token: string
): Promise<IOrder | null> => {
  let verifiedToken = null
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token as string,
      config.jwt.secret as Secret
    )
    const { userPhoneNumber, role } = verifiedToken

    let order

    if (role === 'admin') {
      // If the role is "admin", retrieve the order without any conditions
      order = await Order.findById(id)
        .populate('book')
        .populate('buyer')
        .populate({
          path: 'book',
          populate: {
            path: 'seller',
            model: 'User',
          },
        })
    } else if (role === 'buyer') {
      // If the role is "buyer", retrieve the order where the buyer's role and phoneNumber match
      const buyer = await User.findOne({
        role: 'buyer',
        phoneNumber: userPhoneNumber,
      })

      if (!buyer) {
        throw new Error('You are not a buyer')
      }

      order = await Order.findOne({ _id: id, buyer: buyer._id })
        .populate('book')
        .populate('buyer')
        .populate({
          path: 'book',
          populate: {
            path: 'seller',
            model: 'User',
          },
        })
    } else if (role === 'seller') {
      // If the role is "seller", retrieve the order where the book's seller's role and phoneNumber match
      const seller = await User.findOne({
        role: 'seller',
        phoneNumber: userPhoneNumber,
      })

      if (!seller) {
        throw new Error('You are not a seller')
      }

      order = await Order.findOne({ _id: id })
        .populate({
          path: 'book',
          match: { seller: seller._id },
          populate: {
            path: 'seller',
            model: 'User',
          },
        })
        .populate('buyer')
    } else {
      throw new Error('Invalid user role')
    }

    return order
  } catch (error) {
    throw error
  }
}

export const OrderService = {
  getOrders,
  createOrder,
  getSingleOrder,
}
