import express from 'express'
import { UserController } from './user.controller'
import auth from '../../middlewares/auth'
import { ENUM_USER_ROLE } from '../../../enums/user'
const router = express.Router()

// get all users
router.get('/', auth(ENUM_USER_ROLE.ADMIN), UserController.getAllUsers)
// get my profile
router.get(
  '/my-profile',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.BUYER, ENUM_USER_ROLE.SELLER),
  UserController.getUserProfile
)
router.patch(
  '/my-profile',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.BUYER, ENUM_USER_ROLE.SELLER),
  UserController.updateUserProfile
)
// get single users
router.get('/:id', auth(ENUM_USER_ROLE.ADMIN), UserController.getSingleUser)
router.delete('/:id', auth(ENUM_USER_ROLE.ADMIN), UserController.deleteUser)
router.patch('/:id', auth(ENUM_USER_ROLE.ADMIN), UserController.updateUser)

export const allUserRoutes = router
