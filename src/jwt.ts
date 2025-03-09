import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
	console.error(
		"Missing JWT secrets: Ensure `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` are set in .env"
	);
	process.exit(1);
}

export function createToken(
	userId: string | number,
	username: string
): {
	access_token: string;
	refresh_token: string;
} {
	const payload = {
		userId,
		username,
	};

	const access_token = jwt.sign(payload, ACCESS_TOKEN_SECRET!, {
		expiresIn: "30m",
	} as jwt.SignOptions);

	const refresh_token = jwt.sign(payload, REFRESH_TOKEN_SECRET!, {
		expiresIn: "7d",
	} as jwt.SignOptions);

	return {
		access_token,
		refresh_token,
	};
}

export function verifyAccessToken(
	token: string
): string | jwt.JwtPayload | null {
	try {
		return jwt.verify(token, ACCESS_TOKEN_SECRET!);
	} catch (err) {
		return null;
	}
}
