import { Schema, model } from 'mongoose'
import { IUser, UserModel } from './user.interface'
import config from '../../../config/config'
import bcrypt from 'bcrypt'
// Creating a user schema
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: Number, required: true, unique: true },
    address: { type: String, required: true },
    role: { type: String, enum: ['seller', 'buyer'], required: true },
    password: { type: String, required: true, select: 0 },
    budget: { type: Number, default: 0 },
    income: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
)

userSchema.statics.isUserExist = async function (
  phoneNumber: string
): Promise<Pick<IUser, 'phoneNumber' | 'password' | 'role'> | null> {
  return await User.findOne(
    { phoneNumber },
    { phoneNumber: 1, password: 1, role: 1 }
  )
}

userSchema.statics.isPasswordMatched = async function (
  givenPassword: string,
  savedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword)
}

// pre hook for hashing bcrypt passwords

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds)
    )
  }
  next()
})

// const User = model<IUser>('User', userSchema)
// export default User

export const User = model<IUser, UserModel>('User', userSchema)
