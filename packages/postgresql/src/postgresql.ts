import { Client } from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createToken } from "@aidan-neel/auth";
import type { DatabaseAdapter } from "@aidan-neel/auth/src/adapter";

export class PostgresAdapter implements DatabaseAdapter {
	public client: Client;

	constructor(client: Client) {
		this.client = client; // Configure PG connection options
	}

	async registerUser(
		email: string,
		password: string,
		username?: string
	): Promise<any> {
		const hashedPassword = await bcrypt.hash(password, 10);
		const defaultUsername = username || email.split("@")[0];

		const result = await this.client.query(
			"INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING *",
			[email, defaultUsername, hashedPassword]
		);

		return result.rows[0];
	}

	async loginUser(
		email: string,
		password: string
	): Promise<{ access_token: string; refresh_token: string }> {
		const result = await this.client.query(
			"SELECT * FROM users WHERE email = $1",
			[email]
		);

		if (result.rows.length === 0) throw new Error("Invalid credentials");

		const user = result.rows[0];

		if (!(await bcrypt.compare(password, user.password)))
			throw new Error("Invalid credentials");

		const { access_token, refresh_token } = createToken(
			user.id,
			user.username
		);

		await this.client.query(
			"INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)",
			[
				refresh_token,
				user.id,
				new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			]
		);

		return { access_token, refresh_token };
	}

	async logoutUser(refreshToken: string): Promise<void> {
		await this.client.query("DELETE FROM refresh_tokens WHERE token = $1", [
			refreshToken,
		]);
	}

	async refreshAccessToken(
		refreshToken: string
	): Promise<{ access_token: string; refresh_token: string }> {
		const result = await this.client.query(
			"SELECT * FROM refresh_tokens WHERE token = $1",
			[refreshToken]
		);

		if (result.rows.length === 0) throw new Error("Invalid refresh token");

		await this.client.query("DELETE FROM refresh_tokens WHERE token = $1", [
			refreshToken,
		]);

		const user = result.rows[0];

		const { access_token, refresh_token: new_refresh_token } = createToken(
			user.user_id,
			user.username
		);

		await this.client.query(
			"INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)",
			[
				new_refresh_token,
				user.user_id,
				new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			]
		);

		return { access_token, refresh_token: new_refresh_token };
	}

	async getUserById(
		userId: number
	): Promise<{ id: number; email: string; username: string }> {
		const result = await this.client.query(
			"SELECT id, email, username FROM users WHERE id = $1",
			[userId]
		);

		if (result.rows.length === 0) throw new Error("User not found");

		return result.rows[0];
	}
}
