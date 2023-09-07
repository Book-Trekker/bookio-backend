import ApiError from '../../../errors/ApiError'
import httpStatus from 'http-status'
import { IBook, IBookFilters, IPriceFilters, IReview } from './book.interface'
import { IPaginationOptions } from '../../../interfaces/paginations'
import { IGenericResponse } from '../../../interfaces/common'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { SortOrder } from 'mongoose'
import { bookSearchableFields } from './book.constant'
import { jwtHelpers } from '../../../helpers/jwtHelper'
import config from '../../../config/config'
import { Secret } from 'jsonwebtoken'
import { User } from '../user/user.model'
import Book from './book.model'

const createNewBook = async (
  payload: IBook,
  userPhoneNumber: string,
  role: string
): Promise<IBook> => {
  try {
    const existingBook = await Book.findOne(payload)

    if (existingBook) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Book already exists')
    }

    // Verify seller reference ID with userPhoneNumber and role
    const seller = await User.findOne({
      _id: payload.seller,
      phoneNumber: userPhoneNumber,
      role: role,
    })
    if (!seller) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        'Unauthorized to create a book'
      )
    }

    // Set the type field based on the book rating
    if (payload.rating !== undefined) {
      if (payload.rating >= 4.5) {
        payload.group = 'bestSeller'
      } else if (payload.rating >= 4) {
        payload.group = 'featured'
      } else if (payload.rating >= 3.5) {
        payload.group = 'popular'
      }
    }

    const createdBook = await Book.create(payload)
    if (!createdBook) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create book')
    }

    return createdBook
  } catch (error) {
    throw error
  }
}

// get allCows
const getAllBooks = async (
  filters: IBookFilters,
  paginationOptions: IPaginationOptions,
  priceQuery: IPriceFilters
): Promise<IGenericResponse<IBook[]>> => {
  const { searchTerm, rating, group, ...filtersData } = filters
  // shortCut way
  const andConditions = []

  // price filter
  if (priceQuery.minPrice !== undefined && priceQuery.maxPrice !== undefined) {
    const minPrice = Number(priceQuery.minPrice)
    const maxPrice = Number(priceQuery.maxPrice)

    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
      andConditions.push({
        price: {
          $gte: minPrice,
          $lte: maxPrice,
        },
      })
    }
  } else if (priceQuery.minPrice !== undefined) {
    const minPrice = Number(priceQuery.minPrice)

    if (!isNaN(minPrice)) {
      andConditions.push({
        price: { $gte: minPrice },
      })
    }
  } else if (priceQuery.maxPrice !== undefined) {
    const maxPrice = Number(priceQuery.maxPrice)

    if (!isNaN(maxPrice)) {
      andConditions.push({
        price: { $lte: maxPrice },
      })
    }
  }
  // search term
  if (searchTerm)
    andConditions.push({
      $or: bookSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    })

  // rating filter
  if (rating !== undefined) {
    const maxRating = Number(rating)

    if (!isNaN(maxRating)) {
      andConditions.push({
        rating: { $lte: maxRating },
      })
    }
  }

  // exact filter
  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: {
          $regex: new RegExp(`\\b${value}\\b`, 'i'),
        },
      })),
    })
  }

  // Handle the "group" filter if provided
  if (filters.group) {
    andConditions.push({
      group: filters.group,
    })
  }

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions)

  const sortConditions: { [key: string]: SortOrder } = {}

  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder
  }

  let whereConditions: any =
    andConditions.length > 0 ? { $and: andConditions } : {}

  const result = await Book.find(whereConditions)
    .populate('seller', '-id')
    .sort(sortConditions)
    .skip(skip)
    .limit(limit)

  const total = await Book.countDocuments()

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  }
}

const getSingleBook = async (id: string): Promise<IBook | null> => {
  try {
    const book = await Book.findById(id)
    return book
  } catch (error) {
    throw error
  }
}
// delete book
const deleteBook = async (id: string, token: string): Promise<void> => {
  let verifiedToken = null
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token as string,
      config.jwt.secret as Secret
    )
    const { userPhoneNumber, role } = verifiedToken

    // Find the book document by id
    const book = await Book.findById(id)

    if (!book) {
      throw new Error('Book not found')
    }

    // Find the corresponding seller document in the User collection
    const seller = await User.findOne({ _id: book.seller })

    if (!seller) {
      throw new Error('Seller not found')
    }

    // Check if the seller's phoneNumber matches the userPhoneNumber
    if (seller.phoneNumber !== userPhoneNumber) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'You are not Authorized to delete this Book'
      )
    }
    // Check if the user role is "seller"
    if (role !== 'seller') {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'You are not authorized to delete the book'
      )
    }
    const bookData = await Book.findByIdAndDelete(id)
    if (!bookData) {
      throw new Error('Book not found')
    }
  } catch (error) {
    throw error
  }
}
// update book
const updateBook = async (
  id: string,
  payload: Partial<IBook>,
  token: string
): Promise<IBook | null> => {
  let verifiedToken = null
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token as string,
      config.jwt.secret as Secret
    )
    const { userPhoneNumber, role } = verifiedToken

    // Find the book document by id
    const book = await Book.findById(id)

    if (!book) {
      throw new Error('Book not found')
    }

    // Find the corresponding seller document in the User collection
    const seller = await User.findOne({ _id: book.seller })

    if (!seller) {
      throw new Error('Seller not found')
    }

    // Check if the seller's phoneNumber matches the userPhoneNumber
    if (seller.phoneNumber !== userPhoneNumber) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You are not a seller')
    }
    // Check if the user role is "seller"
    if (role !== 'seller') {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'You are not authorized to update the book'
      )
    }
    const updateBook = await Book.findByIdAndUpdate(id, payload, { new: true })
    return updateBook
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid refresh token')
  }
}

// post review
const addBookReview = async (
  bookId: string,
  reviewData: IReview
): Promise<IBook> => {
  try {
    // Find the book by ID
    const book = await Book.findById(bookId)

    if (!book) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Book not found')
    }

    if (!Array.isArray(book.reviews)) {
      book.reviews = []
    }
    // Add the review to the book's reviews array
    book.reviews.push(reviewData)

    // Save the updated book document
    await book.save()

    return book
  } catch (error) {
    throw error
  }
}

export const bookService = {
  createNewBook,
  getAllBooks,
  getSingleBook,
  deleteBook,
  updateBook,
  addBookReview,
}
