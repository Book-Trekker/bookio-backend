"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminValidation = void 0;
const zod_1 = require("zod");
const adminSchema = zod_1.z.object({
    body: zod_1.z.object({
        role: zod_1.z.string().refine((value) => value === 'admin', {
            message: 'Role must be "admin"',
        }),
        name: zod_1.z.object({
            firstName: zod_1.z.string({ required_error: 'First name is required' }),
            lastName: zod_1.z.string({ required_error: 'Last name is required' }),
        }),
        password: zod_1.z.string({ required_error: 'Password is required' }),
        phoneNumber: zod_1.z.string({ required_error: 'Phone number is required' }),
        address: zod_1.z.string({ required_error: 'Address is required' }),
    }),
});
exports.AdminValidation = {
    adminSchema,
};
