import { PrismaClient } from "@prisma/client";
import { Auth } from "../index";

const Prisma = new PrismaClient();
const auth = new Auth(Prisma);

auth.sessions.createSession("2");
