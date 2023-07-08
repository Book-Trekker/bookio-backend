import express from 'express'
import { OrderController } from './order.controller'
import validateRequest from '../../middlewares/validateRequest'
import { orderValidation } from './order.validation'
import auth from '../../middlewares/auth'
import { ENUM_USER_ROLE } from '../../../enums/user'
const router = express.Router()

// create new order
router.post(
  '/',
  auth(ENUM_USER_ROLE.BUYER),
  validateRequest(orderValidation.orderValidationSchema),
  OrderController.createOrder
)
router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.BUYER, ENUM_USER_ROLE.SELLER),
  OrderController.getAllOrders
)
router.get(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.BUYER, ENUM_USER_ROLE.SELLER),
  OrderController.getSingleOrder
)

export const OrderRoutes = router
