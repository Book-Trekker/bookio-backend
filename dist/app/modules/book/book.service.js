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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookService = void 0;
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const book_constant_1 = require("./book.constant");
const jwtHelper_1 = require("../../../helpers/jwtHelper");
const config_1 = __importDefault(require("../../../config/config"));
const user_model_1 = require("../user/user.model");
const book_model_1 = __importDefault(require("./book.model"));
const createNewBook = (payload, userPhoneNumber, role) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingBook = yield book_model_1.default.findOne(payload);
        if (existingBook) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Book already exists');
        }
        // Verify seller reference ID with userPhoneNumber and role
        const seller = yield user_model_1.User.findOne({
            _id: payload.seller,
            phoneNumber: userPhoneNumber,
            role: role,
        });
        if (!seller) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized to create a book');
        }
        // Set the type field based on the book rating
        if (payload.rating !== undefined) {
            if (payload.rating >= 4.5) {
                payload.group = 'bestSeller';
            }
            else if (payload.rating >= 4) {
                payload.group = 'featured';
            }
            else if (payload.rating >= 3.5) {
                payload.group = 'popular';
            }
        }
        const createdBook = yield book_model_1.default.create(payload);
        if (!createdBook) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create book');
        }
        return createdBook;
    }
    catch (error) {
        throw error;
    }
});
// get allCows
const getAllBooks = (filters, paginationOptions, priceQuery) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm, rating, group } = filters, filtersData = __rest(filters
    // shortCut way
    , ["searchTerm", "rating", "group"]);
    // shortCut way
    const andConditions = [];
    // price filter
    if (priceQuery.minPrice !== undefined && priceQuery.maxPrice !== undefined) {
        const minPrice = Number(priceQuery.minPrice);
        const maxPrice = Number(priceQuery.maxPrice);
        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            andConditions.push({
                price: {
                    $gte: minPrice,
                    $lte: maxPrice,
                },
            });
        }
    }
    else if (priceQuery.minPrice !== undefined) {
        const minPrice = Number(priceQuery.minPrice);
        if (!isNaN(minPrice)) {
            andConditions.push({
                price: { $gte: minPrice },
            });
        }
    }
    else if (priceQuery.maxPrice !== undefined) {
        const maxPrice = Number(priceQuery.maxPrice);
        if (!isNaN(maxPrice)) {
            andConditions.push({
                price: { $lte: maxPrice },
            });
        }
    }
    // search term
    if (searchTerm)
        andConditions.push({
            $or: book_constant_1.bookSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: 'i',
                },
            })),
        });
    // rating filter
    if (rating !== undefined) {
        const maxRating = Number(rating);
        if (!isNaN(maxRating)) {
            andConditions.push({
                rating: { $lte: maxRating },
            });
        }
    }
    // exact filter
    if (Object.keys(filtersData).length) {
        andConditions.push({
            $and: Object.entries(filtersData).map(([field, value]) => ({
                [field]: {
                    $regex: new RegExp(`\\b${value}\\b`, 'i'),
                },
            })),
        });
    }
    //! Same filter in a Normal way
    // const andConditions = [
    //   {
    //     $or: [
    //       {
    //         location: {
    //           $regex: searchTerm,
    //           $options: 'i',
    //         },
    //       },
    //       {
    //         breed: {
    //           $regex: searchTerm,
    //           $options: 'i',
    //         },
    //       },
    //       {
    //         category: {
    //           $regex: searchTerm,
    //           $options: 'i',
    //         },
    //       },
    //     ],
    //   },
    // ]
    // Handle the "group" filter if provided
    if (filters.group) {
        andConditions.push({
            group: filters.group,
        });
    }
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const sortConditions = {};
    if (sortBy && sortOrder) {
        sortConditions[sortBy] = sortOrder;
    }
    let whereConditions = andConditions.length > 0 ? { $and: andConditions } : {};
    const result = yield book_model_1.default.find(whereConditions)
        .sort(sortConditions)
        .skip(skip)
        .limit(limit);
    const total = yield book_model_1.default.countDocuments();
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const getSingleBook = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const book = yield book_model_1.default.findById(id);
        return book;
    }
    catch (error) {
        throw error;
    }
});
// delete book
const deleteBook = (id, token) => __awaiter(void 0, void 0, void 0, function* () {
    let verifiedToken = null;
    try {
        verifiedToken = jwtHelper_1.jwtHelpers.verifyToken(token, config_1.default.jwt.secret);
        const { userPhoneNumber, role } = verifiedToken;
        // Find the book document by id
        const book = yield book_model_1.default.findById(id);
        if (!book) {
            throw new Error('Book not found');
        }
        // Find the corresponding seller document in the User collection
        const seller = yield user_model_1.User.findOne({ _id: book.seller });
        if (!seller) {
            throw new Error('Seller not found');
        }
        // Check if the seller's phoneNumber matches the userPhoneNumber
        if (seller.phoneNumber !== userPhoneNumber) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'You are not Authorized to delete this Book');
        }
        // Check if the user role is "seller"
        if (role !== 'seller') {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'You are not authorized to delete the book');
        }
        const bookData = yield book_model_1.default.findByIdAndDelete(id);
        if (!bookData) {
            throw new Error('Book not found');
        }
    }
    catch (error) {
        throw error;
    }
});
// update book
const updateBook = (id, payload, token) => __awaiter(void 0, void 0, void 0, function* () {
    let verifiedToken = null;
    try {
        verifiedToken = jwtHelper_1.jwtHelpers.verifyToken(token, config_1.default.jwt.secret);
        const { userPhoneNumber, role } = verifiedToken;
        // Find the book document by id
        const book = yield book_model_1.default.findById(id);
        if (!book) {
            throw new Error('Book not found');
        }
        // Find the corresponding seller document in the User collection
        const seller = yield user_model_1.User.findOne({ _id: book.seller });
        if (!seller) {
            throw new Error('Seller not found');
        }
        // Check if the seller's phoneNumber matches the userPhoneNumber
        if (seller.phoneNumber !== userPhoneNumber) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'You are not a seller');
        }
        // Check if the user role is "seller"
        if (role !== 'seller') {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'You are not authorized to update the book');
        }
        const updateBook = yield book_model_1.default.findByIdAndUpdate(id, payload, { new: true });
        return updateBook;
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Invalid refresh token');
    }
});
exports.bookService = {
    createNewBook,
    getAllBooks,
    getSingleBook,
    deleteBook,
    updateBook,
};
