import express from 'express'
import { WishListController } from './wishlist.controller'
const router = express.Router()

router.post('/', WishListController.addToWishList)
router.delete('/:id', WishListController.deleteWishListCart)
router.get('/', WishListController.getWishListCart)
export const WishListRoutes = router
