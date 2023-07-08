import { Schema, model } from 'mongoose'
import { AdminModel, IAdmin } from './admin.interface'
import config from '../../../config/config'
import bcrypt from 'bcrypt'

// Creating a admin schema
const adminSchema = new Schema<IAdmin>(
  {
    role: { type: String, enum: ['admin'], required: true },
    name: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
    },
    password: { type: String, required: true, select: 0 },
    needsPasswordChange: {
      type: Boolean,
      default: true,
    },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
)

adminSchema.statics.isAdminExist = async function (
  phoneNumber: string
): Promise<Pick<
  IAdmin,
  'phoneNumber' | 'password' | 'role' | 'needsPasswordChange'
> | null> {
  return await Admin.findOne(
    { phoneNumber },
    { phoneNumber: 1, password: 1, role: 1, needsPasswordChange: 1 }
  )
}

adminSchema.statics.isPasswordMatched = async function (
  givenPassword: string,
  savedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword)
}

// pre hook for hashing bcrypt passwords

adminSchema.pre('save', async function (next) {
  // hashing admin password
  const admin = this
  admin.password = await bcrypt.hash(
    admin.password,
    Number(config.bcrypt_salt_rounds)
  )
  next()
})

// const Admin = model<IAdmin>('Admin', adminSchema)
// export default Admin

export const Admin = model<IAdmin, AdminModel>('Admin', adminSchema)
