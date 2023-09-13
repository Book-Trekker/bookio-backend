import express from 'express'
import { CartController } from './cart.controller'
const router = express.Router()

router.post('/add-cart', CartController.addToCart)
router.get('/', CartController.getUsersCart)
router.delete('/:id', CartController.deleteUserCart)
export const CartRoutes = router
