import jwt from "jsonwebtoken";
export declare function createToken(userId: string | number, username: string): {
    access_token: string;
    refresh_token: string;
};
export declare function verifyAccessToken(token: string): string | jwt.JwtPayload | null;
