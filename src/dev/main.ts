import { PrismaClient } from "@prisma/client";
import { Auth } from "../index";

const Prisma = new PrismaClient();
const auth = new Auth(Prisma);

async function testAuth() {
	try {
		//let email = Math.floor(Math.random() * 100000) + "@gmail.com";
		let email = "43138@gmail.com";
		let password = "lebron123";

		console.log("📌 Registering User...");
		//const user = await auth.registerUser(email, password);

		console.log("\n📌 Logging In...");
		const loginData = await auth.loginUser(email, password);
		console.log("✅ Logged In:", loginData);
		const { access_token, refresh_token } = loginData;

		setTimeout(async () => {
			await auth.logoutUser(refresh_token);
			console.log("logged out");
		}, 3000);
		return;

		console.log("\n📌 Refreshing Access Token...");
		const refreshedToken = await auth.refreshAccessToken(refresh_token);
		console.log("✅ New Access Token:", refreshedToken);

		console.log("\n📌 Logging Out...");
		await auth.logoutUser(refresh_token);
		console.log("✅ Logged Out Successfully");

		console.log("\n📌 Trying to Refresh Token After Logout...");
		try {
			await auth.refreshAccessToken(refresh_token);
		} catch (err: any) {
			console.log(
				"✅ Refresh Token is Invalid After Logout:",
				err.message
			);
		}
	} catch (err) {
		console.error("❌ Test Failed:", err);
	} finally {
		await Prisma.$disconnect();
	}
}

testAuth();
