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
exports.PostgresAdapter = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("@aidan-neel/auth");
class PostgresAdapter {
    constructor(client) {
        this.client = client; // Configure PG connection options
    }
    registerUser(email, password, username) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const defaultUsername = username || email.split("@")[0];
            const result = yield this.client.query("INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING *", [email, defaultUsername, hashedPassword]);
            return result.rows[0];
        });
    }
    loginUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.query("SELECT * FROM users WHERE email = $1", [email]);
            if (result.rows.length === 0)
                throw new Error("Invalid credentials");
            const user = result.rows[0];
            if (!(yield bcrypt_1.default.compare(password, user.password)))
                throw new Error("Invalid credentials");
            const { access_token, refresh_token } = (0, auth_1.createToken)(user.id, user.username);
            yield this.client.query("INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)", [
                refresh_token,
                user.id,
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            ]);
            return { access_token, refresh_token };
        });
    }
    logoutUser(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.query("DELETE FROM refresh_tokens WHERE token = $1", [
                refreshToken,
            ]);
        });
    }
    refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.query("SELECT * FROM refresh_tokens WHERE token = $1", [refreshToken]);
            if (result.rows.length === 0)
                throw new Error("Invalid refresh token");
            yield this.client.query("DELETE FROM refresh_tokens WHERE token = $1", [
                refreshToken,
            ]);
            const user = result.rows[0];
            const { access_token, refresh_token: new_refresh_token } = (0, auth_1.createToken)(user.user_id, user.username);
            yield this.client.query("INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)", [
                new_refresh_token,
                user.user_id,
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            ]);
            return { access_token, refresh_token: new_refresh_token };
        });
    }
    getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.query("SELECT id, email, username FROM users WHERE id = $1", [userId]);
            if (result.rows.length === 0)
                throw new Error("User not found");
            return result.rows[0];
        });
    }
}
exports.PostgresAdapter = PostgresAdapter;
