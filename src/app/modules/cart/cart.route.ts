import express from 'express'
import { CartController } from './cart.controller'
const router = express.Router()

router.post('/add-cart', CartController.addToCart)
export const CartRoutes = router
