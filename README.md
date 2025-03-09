## @aidan-neel/auth

<b>Open-Source JavaScript and TypeScript authentication</b>

<img src="https://img.shields.io/npm/v/@aidan-neel/auth/latest?style=flat-square&label=version" alt="NPM @aidan-neel/auth@latest" />


`@aidan-neel/auth` implements JWT-based authentication for support with Prisma ORM seamlessly.

## Setup

#### Prisma

Add the following lines to your `schema.prisma` file

```prisma
// Minimum user model
// You can add anything else to it but these 5 are required.
model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  username      String
  password      String
  refreshTokens RefreshToken[]
}

model RefreshToken {
    id        Int    @id @default(autoincrement())
    token     String @unique
    user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)
    userId    Int
    expiresAt DateTime
}
```

Usage

```js
import { Auth } from "@aidan-neel/auth";
import { PrismaClient } from "@prisma/client";

const Prisma = new PrismaClient();
const auth = new Auth(Prisma);
```
