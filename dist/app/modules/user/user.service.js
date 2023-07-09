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
exports.userService = void 0;
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const user_model_1 = require("./user.model");
const admin_model_1 = require("../admin/admin.model");
const createNewUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check budget & income fields for negativity
        const { budget, income } = payload;
        if (budget < 0 || income < 0) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Budget and income must be non-negative');
        }
        // Check duplicate entries
        const existingUser = yield user_model_1.User.findOne({
            phoneNumber: payload.phoneNumber,
        });
        if (existingUser) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Phone Number already exists');
        }
        const createUser = yield user_model_1.User.create(payload);
        return createUser;
    }
    catch (error) {
        throw error;
    }
});
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_model_1.User.find();
        return users;
    }
    catch (error) {
        throw error;
    }
});
const getSingleUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findById(userId);
        return user;
    }
    catch (error) {
        throw error;
    }
});
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findByIdAndDelete(id);
        if (!user) {
            throw new Error('User not found');
        }
    }
    catch (error) {
        throw error;
    }
});
const updateUser = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findByIdAndUpdate(id, payload, { new: true });
        return user;
    }
    catch (error) {
        throw error;
    }
});
const getUserProfile = (userPhoneNumber, role) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findOne({
            phoneNumber: userPhoneNumber,
            role: role,
        });
        if (user) {
            return user;
        }
        const admin = yield admin_model_1.Admin.findOne({
            phoneNumber: userPhoneNumber,
            role: role,
        });
        return admin;
    }
    catch (error) {
        throw error;
    }
});
// update user profile
const updateUserProfile = (userPhoneNumber, role, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedUser = yield user_model_1.User.findOneAndUpdate({
            phoneNumber: userPhoneNumber,
            role: role,
        }, updateData, { new: true } // Return the updated user instead of the old one
        );
        if (updatedUser) {
            return updatedUser;
        }
        const updatedAdmin = yield admin_model_1.Admin.findOneAndUpdate({
            phoneNumber: userPhoneNumber,
            role: role,
        }, updateData, { new: true } // Return the updated user instead of the old one
        );
        return updatedAdmin;
    }
    catch (error) {
        throw error;
    }
});
exports.userService = {
    createNewUser,
    getAllUsers,
    getSingleUser,
    deleteUser,
    updateUser,
    getUserProfile,
    updateUserProfile,
};
