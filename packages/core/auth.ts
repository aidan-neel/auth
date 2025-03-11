import { DatabaseAdapter } from "./adapter";

export type AuthOptions = {
	adapter: DatabaseAdapter;
	//log?: boolean;
};

export class Auth {
	public options: AuthOptions;
	private adapter: DatabaseAdapter;

	constructor(options: AuthOptions) {
		this.options = options;
		this.adapter = options.adapter;
	}

	public registerUser = (
		email: string,
		password: string,
		username?: string
	) => {
		return this.adapter.registerUser(email, password, username);
	};

	public loginUser = (email: string, password: string) => {
		return this.adapter.loginUser(email, password);
	};

	public logoutUser = (refreshToken: string) => {
		return this.adapter.logoutUser(refreshToken);
	};

	public refreshAccessToken = (refreshToken: string) => {
		return this.adapter.refreshAccessToken(refreshToken);
	};

	public getUserById = (userId: number) => {
		return this.adapter.getUserById(userId);
	};
}
