"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
class Auth {
    constructor(options) {
        this.registerUser = (email, password, username) => {
            return this.adapter.registerUser(email, password, username);
        };
        this.loginUser = (email, password) => {
            return this.adapter.loginUser(email, password);
        };
        this.logoutUser = (refreshToken) => {
            return this.adapter.logoutUser(refreshToken);
        };
        this.refreshAccessToken = (refreshToken) => {
            return this.adapter.refreshAccessToken(refreshToken);
        };
        this.getUserById = (userId) => {
            return this.adapter.getUserById(userId);
        };
        this.options = options;
        this.adapter = options.adapter;
    }
}
exports.Auth = Auth;
