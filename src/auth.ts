import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { Sessions } from "./sessions";

export class Auth {
	public Prisma: PrismaClient;

	private session: Sessions;

	constructor(Prisma: PrismaClient) {
		this.Prisma = Prisma;
		this.session = new Sessions(Prisma);
	}

	get sessions() {
		return this.session;
	}

	//async getSession<T>(sessionId: string): Promise<T | null> {}
	//async deleteSession(sessionId: string): Promise<void> {}
}
