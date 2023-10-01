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
    const { books, buyer, quantity } = payload

    // Check if books array is provided
    if (!books || books.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Books array is required')
    }

    // Check null or undefined for quantity
    if (quantity === undefined) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Quantity is required')
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

    let totalBookPrice = 0 // Initialize total book price

    // Iterate over the books array and handle each book
    for (const book of books) {
      // Check book reference id is valid or not
      const existingBook = await Book.findById(book?.bookId)
      if (!existingBook) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid book reference ID')
      }

      // Check if the book is in stock or stock out
      if (existingBook.quantity < quantity) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient book quantity')
      }

      // Calculate the price for this book and add it to the total
      const bookPrice = existingBook.price
      totalBookPrice += bookPrice * quantity
    }

    // check buyer has enough budget to purchase these books or not
    if (totalBookPrice > existingBuyer.budget) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "You don't have sufficient funds to buy these books"
      )
    }

    // start transaction for multiple actions
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Deduct the book quantities & handle book status -> stock | stock out
      for (const book of books) {
        const existingBook = await Book.findById(book?.bookId)
        if (existingBook) {
          existingBook.quantity -= quantity
          if (existingBook.quantity === 0) {
            existingBook.status = 'stock out'
          }
          await existingBook.save()
        }
      }

      // Deduct the total book cost from the buyer's budget
      existingBuyer.budget -= totalBookPrice
      await existingBuyer.save()

      // Increase seller's income by the total book cost
      for (const book of books) {
        const existingBook = await Book.findById(book?.bookId)
        if (existingBook) {
          const existingSeller = await User.findById(existingBook.seller)
          if (!existingSeller) {
            throw new Error('Seller not found')
          }
          existingSeller.income += existingBook.price * quantity
          await existingSeller.save()
        }
      }

      // Create the order
      const createdOrder = await Order.create(payload)
      const populatedOrder = await Order.findById(createdOrder._id)
        .populate('books.bookId') // Populate the book references
        .populate('buyer')

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
        .populate('books.bookId')
        .populate('buyer')
        .populate({
          path: 'books',
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
        .populate('books.bookId')
        .populate('buyer')
        .populate({
          path: 'books',
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
          path: 'books',
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
        .populate('books.bookId')
        .populate('buyer')
        .populate({
          path: 'books',
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
        .populate('books.bookId')
        .populate('buyer')
        .populate({
          path: 'books',
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
          path: 'books',
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
