import { Db } from "mongodb";
import type { DatabaseAdapter } from "@aidan-neel/auth/src/adapter";
export declare class MongoDBAdapter implements DatabaseAdapter {
    db: Db;
    private users;
    private refreshTokens;
    constructor(db: Db);
    registerUser(email: string, password: string, username?: string): Promise<any>;
    loginUser(email: string, password: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logoutUser(refreshToken: string): Promise<void>;
    refreshAccessToken(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    getUserById(userId: number | string): Promise<{
        id: number;
        email: string;
        username: string;
    }>;
}
