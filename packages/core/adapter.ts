export interface DatabaseAdapter {
	registerUser(
		email: string,
		password: string,
		username?: string
	): Promise<any>;

	loginUser(
		email: string,
		password: string
	): Promise<{ access_token: string; refresh_token: string }>;

	logoutUser(refreshToken: string): Promise<void>;

	refreshAccessToken(refreshToken: string): Promise<{
		access_token: string;
		refresh_token: string;
	}>;

	getUserById(
		userId: number
	): Promise<{ id: number; email: string; username: string }>;
}
