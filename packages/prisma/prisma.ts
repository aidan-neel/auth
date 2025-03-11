import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { createToken } from "@aidan-neel/auth/tokens";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { DatabaseAdapter } from "@aidan-neel/auth/adapter";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
	console.error(
		"Missing JWT secrets: Ensure `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` are set in .env"
	);
	process.exit(1);
}

export class PrismaAdapter implements DatabaseAdapter {
	public Prisma: PrismaClient;

	constructor(Prisma: PrismaClient) {
		this.Prisma = Prisma;
	}

	async registerUser(
		email: string,
		password: string,
		username?: string | undefined
	): Promise<any> {
		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await this.Prisma.user.create({
			data: {
				email: email,
				username: username || email.split("@")[0],
				password: hashedPassword,
			},
		});

		console.log("User created successfully:", user);

		return user;
	}

	async loginUser(
		email: string,
		password: string
	): Promise<{
		access_token: string;
		refresh_token: string;
	}> {
		const user = await this.Prisma.user.findUnique({
			where: { email: email },
		});

		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw new Error("Invalid credentials");
		}

		const { access_token, refresh_token } = createToken(
			user.id,
			user.username
		);

		await this.Prisma.refreshToken.create({
			data: {
				token: refresh_token,
				userId: user.id,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
			},
		});

		return { access_token, refresh_token };
	}

	async logoutUser(refreshToken: string) {
		console.log(refreshToken);
		await this.Prisma.refreshToken.delete({
			where: { token: refreshToken },
		});
	}

	async refreshAccessToken(refreshToken: string) {
		const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET!) as {
			userId: number;
			username: string;
		};

		const storedToken = await this.Prisma.refreshToken.findUnique({
			where: { token: refreshToken },
		});

		if (!storedToken) throw new Error("Invalid refresh token");

		await this.Prisma.refreshToken.delete({
			where: { token: refreshToken },
		});

		const { access_token, refresh_token: new_refresh_token } = createToken(
			payload.userId,
			payload.username
		);

		await this.Prisma.refreshToken.create({
			data: {
				token: new_refresh_token,
				userId: payload.userId,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			},
		});

		return { access_token, refresh_token: new_refresh_token };
	}

	async getUserById(userId: number) {
		const user = await this.Prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, email: true, username: true },
		});

		if (!user) throw new Error("User not found");

		return user;
	}
}
