"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const userValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        phoneNumber: zod_1.z.string({
            required_error: 'Phone number is required',
        }),
        role: zod_1.z.enum(['seller', 'buyer'], {
            required_error: 'Role is required and must be either "seller" or "buyer"',
        }),
        password: zod_1.z.string({
            required_error: 'Password is required',
        }),
        name: zod_1.z.object({
            firstName: zod_1.z.string({
                required_error: 'First name is required',
            }),
            lastName: zod_1.z.string({
                required_error: 'Last name is required',
            }),
        }),
        address: zod_1.z.string({
            required_error: 'Address is required',
        }),
        budget: zod_1.z.number().refine((val) => val >= 0, {
            message: 'Budget must be a non-negative number',
        }),
        income: zod_1.z.number().refine((val) => val >= 0, {
            message: 'Income must be a non-negative number',
        }),
    }),
});
exports.UserValidation = {
    userValidationSchema,
};
