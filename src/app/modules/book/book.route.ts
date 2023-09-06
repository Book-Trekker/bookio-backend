import express from 'express'
import { BookController } from './book.controller'
import auth from '../../middlewares/auth'
import { ENUM_USER_ROLE } from '../../../enums/user'
const router = express.Router()

router.post('/', auth(ENUM_USER_ROLE.SELLER), BookController.createBook)
router.get('/', BookController.getAllBooks)

router.post('/reviews/:id', BookController.addReview)
router.get('/reviews/:id', BookController.getAllReview);

router.get('/:id', BookController.getSingleBook)
router.delete('/:id', auth(ENUM_USER_ROLE.SELLER), BookController.deleteBook)
router.patch('/:id', auth(ENUM_USER_ROLE.SELLER), BookController.updateBook)
export const BookRoutes = router
