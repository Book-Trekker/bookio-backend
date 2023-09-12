import express from 'express'
import { UserRoutes } from '../modules/user/user.route'
import { OrderRoutes } from '../modules/order/order.route'
import { allUserRoutes } from '../modules/user/allUserRoutes'
import { AdminRoutes } from '../modules/admin/admin.route'
import { AuthRoutes } from '../modules/auth/auth.route'
import { AuthAdminRoutes } from '../modules/authAdmin/auth.route'
import { BookRoutes } from '../modules/book/book.route'
import { CartRoutes } from '../modules/cart/cart.route'
const router = express.Router()

const moduleRoutes = [
  {
    path: '/auth',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/admins',
    route: AdminRoutes,
  },
  {
    path: '/admins',
    route: AuthAdminRoutes,
  },
  {
    path: '/users',
    route: allUserRoutes,
  },
  {
    path: '/books',
    route: BookRoutes,
  },
  {
    path: '/orders',
    route: OrderRoutes,
  },
  {
    path: '/cart',
    route: CartRoutes,
  },
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
