import { DatabaseAdapter } from "./adapter";
export type AuthOptions = {
    adapter: DatabaseAdapter;
};
export declare class Auth {
    options: AuthOptions;
    private adapter;
    constructor(options: AuthOptions);
    registerUser: (email: string, password: string, username?: string) => Promise<any>;
    loginUser: (email: string, password: string) => Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logoutUser: (refreshToken: string) => Promise<void>;
    refreshAccessToken: (refreshToken: string) => Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    getUserById: (userId: number) => Promise<{
        id: number;
        email: string;
        username: string;
    }>;
}
