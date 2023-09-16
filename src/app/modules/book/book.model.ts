import { Schema, model } from 'mongoose'
import { IBook } from './book.interface'

// Creating a user schema
const bookSchema = new Schema<IBook>(
  {
    name: { type: String, required: true },
    author: { type: String, required: true },
    image: [
      {
        publicId: { type: String },
        url: { type: String },
      },
    ],
    discountPercentage: { type: Number, default: 0 },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    quantity: { type: Number, required: true },
    color: { type: String, default: 'normal' },
    sellCount: { type: Number },
    status: { type: String, default: 'In Stock' },
    category: {
      type: String,
      enum: ['science', 'adventure', 'romance'],
      required: true,
    },
    discountTime: { type: Schema.Types.Mixed },
    seller: {
      type: String,
      ref: 'User',
      required: true,
    },
    reviews: [
      {
        name: { type: String, required: true },
        email: { type: String, required: true },
        individualRating: { type: Number, required: true },
        userReview: { type: String, required: true },
        date: { type: Date, default: new Date() },
      },
      {
        timestamps: true,
      },
    ],
    group: {
      type: String,
      default: 'Popular',
    },
  },
  {
    timestamps: true,
  }
)

const Book = model<IBook>('Book', bookSchema)
export default Book
