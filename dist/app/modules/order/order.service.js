"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const order_model_1 = __importDefault(require("./order.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("../user/user.model");
const jwtHelper_1 = require("../../../helpers/jwtHelper");
const config_1 = __importDefault(require("../../../config/config"));
const book_model_1 = __importDefault(require("../book/book.model"));
const createOrder = (payload, userPhoneNumber, role) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { book, buyer, quantity } = payload;
        // check null or undefined for quantity
        if (quantity === undefined) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Quantity is required');
        }
        // check book reference id is valid or not
        const existingBook = yield book_model_1.default.findById(book);
        if (!existingBook) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid book reference ID');
        }
        // Check if the book is in stock or stock out
        if (existingBook.quantity < quantity) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Insufficient book quantity');
        }
        // Verify the buyer ID using userPhoneNumber and role
        const existingBuyer = yield user_model_1.User.findOne({
            _id: buyer,
            phoneNumber: userPhoneNumber,
            role: role,
        });
        if (!existingBuyer) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid buyer reference ID');
        }
        // check existing order
        // const existingOrder = await Order.findOne(payload)
        // if (existingOrder) {
        //   throw new ApiError(httpStatus.BAD_REQUEST, 'Already purchased this book')
        // }
        const bookPrice = existingBook.price;
        const buyerBudget = existingBuyer.budget;
        const sellerId = existingBook.seller;
        // check buyer have enough budget to purchase this book or not
        if (bookPrice * quantity > buyerBudget) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "You don't have sufficient funds to buy these books");
        }
        // start transaction for multiple actions
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // Deduct the book quantity & handle book status -> stock | stock out
            existingBook.quantity -= quantity;
            if (existingBook.quantity === 0) {
                existingBook.status = 'stock out';
            }
            yield existingBook.save();
            // Deduct book cost from the buyer's budget
            existingBuyer.budget -= bookPrice * quantity;
            yield existingBuyer.save();
            // Increase seller's income by the book cost
            const existingSeller = yield user_model_1.User.findById(sellerId);
            if (!existingSeller) {
                throw new Error('Seller not found');
            }
            existingSeller.income += bookPrice * quantity;
            yield existingSeller.save();
            // Create the order
            const createdOrder = yield order_model_1.default.create(payload);
            const populatedOrder = yield order_model_1.default.findById(createdOrder._id)
                .populate('book')
                .populate('buyer')
                .populate({
                path: 'book',
                populate: {
                    path: 'seller',
                    model: 'User',
                },
            });
            yield session.commitTransaction();
            session.endSession();
            if (!populatedOrder) {
                throw new Error('Failed to populate the created order');
            }
            return populatedOrder.toObject();
        }
        catch (error) {
            yield session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
    catch (error) {
        throw error;
    }
});
const getOrders = (token) => __awaiter(void 0, void 0, void 0, function* () {
    let verifiedToken = null;
    try {
        verifiedToken = jwtHelper_1.jwtHelpers.verifyToken(token, config_1.default.jwt.secret);
        const { userPhoneNumber, role } = verifiedToken;
        let orders;
        if (role === 'admin') {
            // If the role is "admin", retrieve all orders
            orders = yield order_model_1.default.find({})
                .populate('book')
                .populate('buyer')
                .populate({
                path: 'book',
                populate: {
                    path: 'seller',
                    model: 'User',
                },
            });
        }
        else if (role === 'buyer') {
            // If the role is "buyer", retrieve orders where the buyer's role and phoneNumber match
            const buyer = yield user_model_1.User.findOne({
                role: 'buyer',
                phoneNumber: userPhoneNumber,
            });
            if (!buyer) {
                throw new Error('You are not a buyer');
            }
            orders = yield order_model_1.default.find({ buyer: buyer._id })
                .populate('book')
                .populate('buyer')
                .populate({
                path: 'book',
                populate: {
                    path: 'seller',
                    model: 'User',
                },
            });
        }
        else if (role === 'seller') {
            // If the role is "seller", retrieve orders where the book's seller's role and phoneNumber match
            const seller = yield user_model_1.User.findOne({
                role: 'seller',
                phoneNumber: userPhoneNumber,
            });
            if (!seller) {
                throw new Error('You are not a seller');
            }
            orders = yield order_model_1.default.find({})
                .populate({
                path: 'book',
                match: { seller: seller._id },
                populate: {
                    path: 'seller',
                    model: 'User',
                },
            })
                .populate('buyer');
        }
        else {
            throw new Error('Invalid user role');
        }
        return orders;
    }
    catch (error) {
        throw error;
    }
});
const getSingleOrder = (id, token) => __awaiter(void 0, void 0, void 0, function* () {
    let verifiedToken = null;
    try {
        verifiedToken = jwtHelper_1.jwtHelpers.verifyToken(token, config_1.default.jwt.secret);
        const { userPhoneNumber, role } = verifiedToken;
        let order;
        if (role === 'admin') {
            // If the role is "admin", retrieve the order without any conditions
            order = yield order_model_1.default.findById(id)
                .populate('book')
                .populate('buyer')
                .populate({
                path: 'book',
                populate: {
                    path: 'seller',
                    model: 'User',
                },
            });
        }
        else if (role === 'buyer') {
            // If the role is "buyer", retrieve the order where the buyer's role and phoneNumber match
            const buyer = yield user_model_1.User.findOne({
                role: 'buyer',
                phoneNumber: userPhoneNumber,
            });
            if (!buyer) {
                throw new Error('You are not a buyer');
            }
            order = yield order_model_1.default.findOne({ _id: id, buyer: buyer._id })
                .populate('book')
                .populate('buyer')
                .populate({
                path: 'book',
                populate: {
                    path: 'seller',
                    model: 'User',
                },
            });
        }
        else if (role === 'seller') {
            // If the role is "seller", retrieve the order where the book's seller's role and phoneNumber match
            const seller = yield user_model_1.User.findOne({
                role: 'seller',
                phoneNumber: userPhoneNumber,
            });
            if (!seller) {
                throw new Error('You are not a seller');
            }
            order = yield order_model_1.default.findOne({ _id: id })
                .populate({
                path: 'book',
                match: { seller: seller._id },
                populate: {
                    path: 'seller',
                    model: 'User',
                },
            })
                .populate('buyer');
        }
        else {
            throw new Error('Invalid user role');
        }
        return order;
    }
    catch (error) {
        throw error;
    }
});
exports.OrderService = {
    getOrders,
    createOrder,
    getSingleOrder,
};
