import express from 'express'
import { adminController } from './admin.controller'
import validateRequest from '../../middlewares/validateRequest'
import { AdminValidation } from './admin.validation'
const router = express.Router()

// create new admin
router.post(
  '/create-admin',
  validateRequest(AdminValidation.adminSchema),
  adminController.createAdmin
)

export const AdminRoutes = router
