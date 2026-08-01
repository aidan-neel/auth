import { Collection, Db, ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { createToken } from "@aidan-neel/auth";
import type { DatabaseAdapter } from "@aidan-neel/auth/src/adapter";

interface User {
	_id?: ObjectId;
	email: string;
	username: string;
	password: string;
}

interface RefreshToken {
	_id?: ObjectId;
	token: string;
	userId: ObjectId;
	username: string;
	expiresAt: Date;
}

export class MongoDBAdapter implements DatabaseAdapter {
	public db: Db;
	private users: Collection<User>;
	private refreshTokens: Collection<RefreshToken>;

	constructor(db: Db) {
		this.db = db;
		this.users = db.collection<User>("users");
		this.refreshTokens = db.collection<RefreshToken>("refresh_tokens");
	}

	async registerUser(
		email: string,
		password: string,
		username?: string
	): Promise<any> {
		const hashedPassword = await bcrypt.hash(password, 10);
		const defaultUsername = username || email.split("@")[0];

		const result = await this.users.insertOne({
			email,
			username: defaultUsername,
			password: hashedPassword,
		});

		return {
			id: result.insertedId,
			email,
			username: defaultUsername,
		};
	}

	async loginUser(
		email: string,
		password: string
	): Promise<{ access_token: string; refresh_token: string }> {
		const user = await this.users.findOne({ email });

		if (!user || !(await bcrypt.compare(password, user.password)))
			throw new Error("Invalid credentials");

		const { access_token, refresh_token } = createToken(
			user._id.toString(),
			user.username
		);

		await this.refreshTokens.insertOne({
			token: refresh_token,
			userId: user._id,
			username: user.username,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		});

		return { access_token, refresh_token };
	}

	async logoutUser(refreshToken: string): Promise<void> {
		await this.refreshTokens.deleteOne({ token: refreshToken });
	}

	async refreshAccessToken(
		refreshToken: string
	): Promise<{ access_token: string; refresh_token: string }> {
		const storedToken = await this.refreshTokens.findOne({
			token: refreshToken,
		});

		if (!storedToken) throw new Error("Invalid refresh token");

		await this.refreshTokens.deleteOne({ token: refreshToken });

		const { access_token, refresh_token: new_refresh_token } = createToken(
			storedToken.userId.toString(),
			storedToken.username
		);

		await this.refreshTokens.insertOne({
			token: new_refresh_token,
			userId: storedToken.userId,
			username: storedToken.username,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		});

		return { access_token, refresh_token: new_refresh_token };
	}

	async getUserById(
		userId: number | string
	): Promise<{ id: number; email: string; username: string }> {
		const user = await this.users.findOne({
			_id: new ObjectId(String(userId)),
		});

		if (!user) throw new Error("User not found");

		return {
			id: user._id as unknown as number,
			email: user.email,
			username: user.username,
		};
	}
}
