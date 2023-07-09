"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Creating a user schema
const bookSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    author: { type: String, required: true },
    image: { type: [String], required: true },
    discountPercentage: { type: Number, default: 0 },
    price: { type: Number, required: true },
    wishList: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    quantity: { type: Number, required: true },
    sellCount: { type: Number },
    status: { type: String, default: 'In Stock' },
    category: {
        type: String,
        enum: ['science', 'adventure', 'romance'],
        required: true,
    },
    discountTime: { type: mongoose_1.Schema.Types.Mixed },
    seller: {
        type: String,
        required: true,
    },
    group: {
        type: String,
    },
}, {
    timestamps: true,
});
const Book = (0, mongoose_1.model)('Book', bookSchema);
exports.default = Book;
