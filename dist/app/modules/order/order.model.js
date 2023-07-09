"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Creating a order schema
const orderSchema = new mongoose_1.Schema({
    book: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Book' },
    buyer: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' },
    quantity: { type: Number },
}, { timestamps: true });
const Order = (0, mongoose_1.model)('orders', orderSchema);
exports.default = Order;
