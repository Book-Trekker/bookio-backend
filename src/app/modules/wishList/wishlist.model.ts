import { Schema, model } from 'mongoose'
import { ICartItem } from './wishlist.interface'

// Creating a cart schema
const wishListSchema = new Schema<ICartItem>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    bookId: {
      type: String,
      ref: 'Book',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Define post middleware for 'save' operation
// wishListSchema.post('save', async function (doc) {
//   try {
//     // Load the corresponding book document
//     const Book = model('Book')
//     const book = await Book.findById(doc.bookId)

//     // Update the 'color' field of the book document to 'red'
//     book.color = 'red'
//     await book.save()
//   } catch (error) {
//     console.error('Error updating book color:', error)
//   }
// })

// // Define post middleware for 'remove' operation
// wishListSchema.pre('remove', async function (doc) {
//   try {
//     // Load the corresponding book document
//     const Book = model('Book') // Assuming 'Book' is the correct model name
//     const book = await Book.findById(doc.bookId)

//     // Update the 'color' field of the book document back to 'normal'
//     book.color = 'normal'
//     await book.save()
//   } catch (error) {
//     console.error('Error updating book color:', error)
//   }
// })

const WishList = model<ICartItem>('WishList', wishListSchema)

export default WishList
