import NextAuth from "next-auth/next";
import CredentialProvider from "next-auth/providers/credentials";
import { verifyPassword } from "@lib/auth";
import prisma from "@lib/prisma";

export default NextAuth({
	providers: [
		CredentialProvider({
			async authorize(credentials) {
				// Cari user_id
				const user = await prisma.tbl_user.findFirst({
					where: {
						user_id: credentials.username,
					},
				});

				// secara default akan redirect ke error page
				if (!user) {
					console.log("User ga ketemu");
					throw new Error("User tidak ditemukan");
				}

				// Jika User ID ditemukan, maka selanjutnya verify password nya
				const isValid = await verifyPassword(
					credentials.password,
					user.password
				);

				if (!isValid) {
					console.log("Password beda");
					throw new Error(`Salah Password !`);
				}

				// Jika Password OK, buat struktur untuk dipass ke Session
				const hasil = {
					id: user.id,
					username: user.user_id,
					nama_lengkap: user.nama,
					company: user.comp_code,
				};
				return hasil;
			},
		}),
	],
	callbacks: {
		jwt: async ({ token, user }) => {
			user && (token.user = user);
			return token;
		},
		session: async ({ session, token }) => {
			session.user = token.user;
			return session;
		},
	},
	secret: "15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225",
	jwt: {
		secret: "15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225",
		encryption: true,
	},
	session: {
		// Seconds - How long until an idle session expires and is no longer valid.
		maxAge: 7 * 24 * 60 * 60, // 7 hari
	},
});
