export type IBook = {
  name: string
  author: string
  bookId?: string
  images?: {
    publicId?: string
    url?: string
  }[]
  discountPercentage?: number
  price: number
  rating?: number
  avgRating?: number
  quantity: number
  color?: string
  sellCount?: number
  category: 'science' | 'adventure' | 'romance'
  discountTime?: number | string
  status?: string
  seller: string
  group?: string
  description: string
  reviews?: IReview[]
}

export type IBookFilters = {
  searchTerm?: string
  rating?: number
  group?: string
}
export type IPriceFilters = {
  maxPrice?: number
  minPrice?: number
}

export type IReview = {
  name: string
  email: string
  individualRating: number
  userReview: string
  date?: Date
}
export type IWishList = {
  userId: string
  bookId: string
}
