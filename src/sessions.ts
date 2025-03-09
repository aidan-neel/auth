import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";

interface Session {
	sessionId: string;
	userId: string;
	createdAt: Date;
	expiresAt: Date;
}

export class Sessions {
	private Prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.Prisma = prisma;
	}

	async createSession(userId: string): Promise<string> {
		const sessionId = uuidv4();
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 24);
	}

	//async getSession<T>(sessionId: string): Promise<T | null> {}
	//async deleteSession(sessionId: string): Promise<void> {}
}
