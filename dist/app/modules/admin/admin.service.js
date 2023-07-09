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
exports.adminService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const admin_model_1 = require("./admin.model");
const user_model_1 = require("../user/user.model");
const createAdmin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check duplicate entries
        const existingAdmin = yield admin_model_1.Admin.findOne({
            phoneNumber: payload.phoneNumber,
        });
        const existingUser = yield user_model_1.User.findOne({
            phoneNumber: payload.phoneNumber,
        });
        if (existingAdmin || existingUser) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Phone Number already exists');
        }
        const createAdmin = yield admin_model_1.Admin.create(payload);
        return createAdmin;
    }
    catch (error) {
        throw error;
    }
});
exports.adminService = { createAdmin };
