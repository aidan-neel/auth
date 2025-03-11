import { PrismaClient } from "@prisma/client";
import { DatabaseAdapter } from "@aidan-neel/auth/src/adapter";
export declare class PrismaAdapter implements DatabaseAdapter {
	Prisma: PrismaClient;
	constructor(Prisma: PrismaClient);
	registerUser(
		email: string,
		password: string,
		username?: string | undefined
	): Promise<any>;
	loginUser(
		email: string,
		password: string
	): Promise<{
		access_token: string;
		refresh_token: string;
	}>;
	logoutUser(refreshToken: string): Promise<void>;
	refreshAccessToken(refreshToken: string): Promise<{
		access_token: string;
		refresh_token: string;
	}>;
	getUserById(userId: number): Promise<any>;
}
