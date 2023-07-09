"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderValidation = void 0;
const zod_1 = require("zod");
const orderValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        book: zod_1.z.string().nonempty('Book is required'),
        buyer: zod_1.z.string().nonempty('Buyer is required'),
        quantity: zod_1.z.number().optional(),
    }),
});
exports.orderValidation = {
    orderValidationSchema,
};
