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
exports.MongoDBAdapter = void 0;
const mongodb_1 = require("mongodb");
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("@aidan-neel/auth");
class MongoDBAdapter {
    constructor(db) {
        this.db = db;
        this.users = db.collection("users");
        this.refreshTokens = db.collection("refresh_tokens");
    }
    registerUser(email, password, username) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const defaultUsername = username || email.split("@")[0];
            const result = yield this.users.insertOne({
                email,
                username: defaultUsername,
                password: hashedPassword,
            });
            return {
                id: result.insertedId,
                email,
                username: defaultUsername,
            };
        });
    }
    loginUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.users.findOne({ email });
            if (!user || !(yield bcrypt_1.default.compare(password, user.password)))
                throw new Error("Invalid credentials");
            const { access_token, refresh_token } = (0, auth_1.createToken)(user._id.toString(), user.username);
            yield this.refreshTokens.insertOne({
                token: refresh_token,
                userId: user._id,
                username: user.username,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            return { access_token, refresh_token };
        });
    }
    logoutUser(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.refreshTokens.deleteOne({ token: refreshToken });
        });
    }
    refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const storedToken = yield this.refreshTokens.findOne({
                token: refreshToken,
            });
            if (!storedToken)
                throw new Error("Invalid refresh token");
            yield this.refreshTokens.deleteOne({ token: refreshToken });
            const { access_token, refresh_token: new_refresh_token } = (0, auth_1.createToken)(storedToken.userId.toString(), storedToken.username);
            yield this.refreshTokens.insertOne({
                token: new_refresh_token,
                userId: storedToken.userId,
                username: storedToken.username,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            return { access_token, refresh_token: new_refresh_token };
        });
    }
    getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.users.findOne({
                _id: new mongodb_1.ObjectId(String(userId)),
            });
            if (!user)
                throw new Error("User not found");
            return {
                id: user._id,
                email: user.email,
                username: user.username,
            };
        });
    }
}
exports.MongoDBAdapter = MongoDBAdapter;
