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
exports.PrismaAdapter = void 0;
const auth_1 = require("@aidan-neel/auth");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    console.error("Missing JWT secrets: Ensure `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` are set in .env");
    process.exit(1);
}
class PrismaAdapter {
    constructor(Prisma) {
        this.Prisma = Prisma;
    }
    registerUser(email, password, username) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            const user = yield this.Prisma.user.create({
                data: {
                    email: email,
                    username: username || email.split("@")[0],
                    password: hashedPassword,
                },
            });
            console.log("User created successfully:", user);
            return user;
        });
    }
    loginUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.Prisma.user.findUnique({
                where: { email: email },
            });
            if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
                throw new Error("Invalid credentials");
            }
            const { access_token, refresh_token } = (0, auth_1.createToken)(user.id, user.username);
            yield this.Prisma.refreshToken.create({
                data: {
                    token: refresh_token,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                },
            });
            return { access_token, refresh_token };
        });
    }
    logoutUser(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(refreshToken);
            yield this.Prisma.refreshToken.delete({
                where: { token: refreshToken },
            });
        });
    }
    refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = jsonwebtoken_1.default.verify(refreshToken, REFRESH_TOKEN_SECRET);
            const storedToken = yield this.Prisma.refreshToken.findUnique({
                where: { token: refreshToken },
            });
            if (!storedToken)
                throw new Error("Invalid refresh token");
            yield this.Prisma.refreshToken.delete({
                where: { token: refreshToken },
            });
            const { access_token, refresh_token: new_refresh_token } = (0, auth_1.createToken)(payload.userId, payload.username);
            yield this.Prisma.refreshToken.create({
                data: {
                    token: new_refresh_token,
                    userId: payload.userId,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
            return { access_token, refresh_token: new_refresh_token };
        });
    }
    getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.Prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, email: true, username: true },
            });
            if (!user)
                throw new Error("User not found");
            return user;
        });
    }
}
exports.PrismaAdapter = PrismaAdapter;
