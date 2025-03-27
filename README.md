## @aidan-neel/auth

<b>Open-Source TypeScript authentication</b>

<img src="https://img.shields.io/npm/v/@aidan-neel/auth/latest?style=flat-square&label=version" alt="NPM @aidan-neel/auth@latest" />

`@aidan-neel/auth` implements JWT-based authentication for support with Prisma ORM seamlessly.

## Setup

#### Prisma

Add the following lines to your `schema.prisma` file and install the prisma adapter

```prisma
// You can add anything else to it but these 6 are required
model User {
    id            Int       @id @default(autoincrement())
    email         String    @unique
    username      String
    password      String
    refreshTokens RefreshToken[]
    @@map("users")
}

model RefreshToken {
    id        Int      @id @default(autoincrement())
    token     String   @unique
    user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    userId    Int      @map("user_id")
    expiresAt DateTime @map("expires_at")
    @@map("refresh_tokens")
}
```

## Install

`npm install @aidan-neel/auth`

## Usage

#### Example with Prisma

Install the adapter
`npm install @aidan-neel/auth-prisma`

```js
import { Auth } from "@aidan-neel/auth";
import { PrismaAdapter } from "@aidan-neel/auth-prisma";
import { PrismaClient } from "@prisma/client";

const Prisma = new PrismaClient();
const auth = new Auth({
	adapter: new PrismaAdapter(Prisma),
});

// Register
await auth.registerUser(email, password);

// Login
const { access_token, refresh_token } = await auth.loginUser(email, password);

// Refresh Access Token
const { refreshed_access_token, refreshed_token } =
	await auth.refreshAccessToken(refresh_token);

// Logout
await auth.logoutUser(refreshed_token);
```

## Adapters

-   `@aidan-neel/auth-postgresql`
-   `@aidan-neel/auth-prisma`
