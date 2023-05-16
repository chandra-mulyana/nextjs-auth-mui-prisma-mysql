# Next.js + MUI5 + Prisma + MySQL + NextAuth

Berikut ini contoh program menggunakan :

-   `Next.js` (https://nextjs.org/)
-   `Material UI` (https://mui.com/) untuk UI nya
-   `Prisma` (https://www.prisma.io/) sebagai ORM nya.
-   `MySQL` sebagai Database nya
-   `NextAuth` (https://next-auth.js.org/) untuk otentikasi

## Integrasi Next.js dengan MUI

Silahkan bisa gunakan template yang ada di :

https://github.com/chandra-mulyana/starter-nextjs13-mui5

## Pembuatan Database di MySQL

```
Database  : belajar
User      : user_belajar
Password  : Belajar234
```

Script untuk membuat tabel `tbl_user`

```
CREATE TABLE `belajar`.`tbl_user` (
`id` INT NOT NULL AUTO_INCREMENT ,
`user_id` VARCHAR(50) NULL DEFAULT NULL ,
`nama` VARCHAR(50) NULL DEFAULT NULL ,
`comp_code` VARCHAR(4) NULL DEFAULT NULL ,
`password` VARCHAR(100) NULL DEFAULT NULL ,
PRIMARY KEY (`id`)) ENGINE = InnoDB;
```

## Enkripsi Password

Untuk enkripsi Password biasanya menggunakan Bcrypt di :

https://bcrypt-generator.com/

Lalu Pilih Rounds : 12

Sehingga jika password untuk User : `Initial123#`
Hasil Enkripsi nya adalah : `$2a$12$AArumIqL7nV/0BhtTDGb/uo29r7G/vrf9.z7So/ODV6TaO/y5xZ.K`

Hasil Enkripsi ini bisa diinsert ke tabel untuk pertama kali sehingga perintah nya sebagai berikut :

```
INSERT INTO `tbl_user` (`id`, `user_id`, `nama`, `comp_code`, `password`)
VALUES (NULL, 'chandra', 'Chandra Mulyana', 'TRNT', '$2a$12$AArumIqL7nV/0BhtTDGb/uo29r7G/vrf9.z7So/ODV6TaO/y5xZ.K');
```

## Install Prisma

```javascript
npm install prisma
```

## Inisialisasi Prisma

Jalankan perintah berikut :

```javascript
npx prisma init
```

Sehingga muncul seperti ini :

```javascript
✔ Your Prisma schema was created at prisma/schema.prisma
  You can now open it in your favorite editor.

warn You already have a .gitignore file. Don't forget to add `.env` in it to not commit any private information.

Next steps:
1. Set the DATABASE_URL in the .env file to point to your existing database. If your database has no tables yet, read https://pris.ly/d/getting-started
2. Set the provider of the datasource block in schema.prisma to match your database: postgresql, mysql, sqlite, sqlserver, mongodb or cockroachdb.
3. Run prisma db pull to turn your database schema into a Prisma schema.
4. Run prisma generate to generate the Prisma Client. You can then start querying your database.

More information in our documentation:
https://pris.ly/d/getting-started
```

Perintah di atas akan membuat sebuah file `schema.prisma` di dalam folder `prisma`.
File ini berisi struktur database.

Selain itu juga akan membuat file `.env` yang berisi connection string untuk ke database

## Setting Connection String untuk MySQL

Berikut Settingan MySQL untuk skenario kali ini

```
Database  : belajar
User      : user_belajar
Password  : Belajar234
```

Buka `.env` file dan replace dengan settingan untuk MySQL.
Jika mengikuti skenario di atas , maka Connection String-nya adalah sbb

```javascript
DATABASE_URL = "mysql://user_belajar:Belajar234@localhost:3306/belajar";
```

Kemudian setting juga `provider db` di file `schema.prisma` sehingga isinya sebagai berikut :

```javascript
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

## PULL DATABASE

Skenario dalam Prisma ada 2:

1. PULL Database : Menarik skema dari Database ke Prisma. Perintah nya : `npx prisma db pull`
2. PUSH Database : Mengirimkan/Update skema dari Prisma ke Database. Perintah nya : `npx prisma db push`

Kali ini kita menggunakan `skenario 1 -> PULL DB`.
Design database dilakukan diluar Prisma, misalnya dalam kasus kali ini untuk Design Database dilakukan di PHPMyAdmin.
Kemudian kita akan tarik skema Database nya ke dalam Prisma dengan perintah sebagai berikut :

```javascript
npx prisma db pull
```

Output nya adalah sebagai berikut :

```javascript
Prisma schema loaded from prisma\schema.prisma
Environment variables loaded from .env
Datasource "db": MySQL database "belajar" at "localhost:3306"

✔ Introspected 1 model and wrote it into prisma\schema.prisma in 92ms

Run prisma generate to generate Prisma Client.
```

Silahkan check isi file `prisma\schema.prisma` isinya menjadi seperti di bawah ini :

```javascript
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model tbl_user {
  id        Int     @id @default(autoincrement())
  user_id   String? @db.VarChar(50)
  nama      String? @db.VarChar(50)
  comp_code String? @db.VarChar(4)
  password  String? @db.VarChar(100)
}
```

Agar Prisma Client dalam aplikasi Next.js ini dapat mengakses tabel-tabel tersebut, maka sesuai perintah Prisma sebelumnya
`Run prisma generate to generate Prisma Client.`

Lakukan perintah berikut :

```javascript
npx prisma generate
```

Nanti akan muncul seperti di bawah ini :

```javascript
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

added 2 packages, and audited 354 packages in 20s

114 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

✔ Installed the @prisma/client and prisma packages in your project

✔ Generated Prisma Client (4.14.0 | library) to .\node_modules\@prisma\client in 102ms

You can now start using Prisma Client in your code. Reference: https://pris.ly/d/client
---
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
---
```

## Membuat library untuk akses Prisma

Buat directory `lib` pada root directory. Kemudian buat sebuah file dengan nama `prisma.js` yang isinya adalah sebagai berikut

```javascript
import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
	prisma = new PrismaClient();
} else {
	if (!global.prisma) {
		global.prisma = new PrismaClient();
	}
	prisma = global.prisma;
}

export default prisma;
```

## Menampilkan isi tabel

Kita modifikasi file `index.js` yang sebelumnya seperti ini :

```javascript
import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function Index() {
	return (
		<Container maxWidth="lg">
			<Box
				sx={{
					my: 4,
					p: 2,
					borderRadius: "10px",
					backgroundColor: "background.paper",
				}}
			>
				<Typography variant="h6" component="h1" gutterBottom>
					Belajar Prisma
				</Typography>
			</Box>
		</Container>
	);
}
```

menjadi seperti ini :

```javascript
import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";

// Ini untuk memanggil Prisma
import prisma from "../lib/prisma";

Index.propTypes = {
	list_user: PropTypes.array,
};

export default function Index(props) {
	return (
		<Container maxWidth="lg">
			<Box
				sx={{
					my: 4,
					p: 2,
					borderRadius: "10px",
					backgroundColor: "background.paper",
				}}
			>
				<Typography variant="h6" component="h1" gutterBottom>
					Belajar Prisma
				</Typography>
				<ul>
					{props.list_user.map((baris) => (
						<li key={baris.id}>
							ID User {baris.id} - User ID : {baris.user_id} -
							Nama : {baris.nama}
						</li>
					))}
				</ul>
			</Box>
		</Container>
	);
}

// Kita akan gunakan getServerSideProps untuk ambil isi tabel
export async function getServerSideProps() {
	// Load semua isi tbl_user
	const isi_tbl_user = await prisma.tbl_user.findMany({});

	return {
		props: {
			list_user: isi_tbl_user,
		},
	};
}
```

Jika sudah bisa tampil, maka Next.js sudah terkoneksi ke MySQL menggunakan Prisma.
Selanjutnya adalah instalasi NextAuth

## Install NextAuth

```bash
npm install next-auth
```

## Buat file [...nextauth].js

-   Buat folder `auth` di dalam folder `api`
-   Buat file `[...nextauth].js` dalam folder auth tersebut

isi dari [...nextauth].js adalah sbb:

```bash
import NextAuth from "next-auth/next";
import CredentialProvider from "next-auth/providers/credentials";

export default NextAuth({
	providers: [
		CredentialProvider({
			authorize: (credentials) => {
				// disini nanti dimasukan pencarian ke database, untuk sementara di hardcode
				if (
					credentials.username === "admin" &&
					credentials.password === "test"
				) {
					return {
						id: 1,
						name: "chandra",
						email: "chandra.mulyana@trisula.com",
					};
				}
				// Jika login nya gagal
				return null;
			},
		}),
	],
	callback: {
		jwt: ({ token, user }) => {
			// first time jwt call back is run, user object is available
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		session: ({ session, token }) => {
			if (token) {
				session.id = token.id;
			}
			return session;
		},
	},
	secret: "15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225",
	jwt: {
		secret: "15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225",
		encryption: true,
	},
});
```

Kemudian edit `_app.js` menjadi seperti di bawah ini :

```javascript
import * as React from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import theme from "../src/theme";
import createEmotionCache from "../src/createEmotionCache";
import { SessionProvider } from "next-auth/react";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export default function MyApp(props) {
	const {
		Component,
		emotionCache = clientSideEmotionCache,
		pageProps,
	} = props;

	return (
		<SessionProvider>
			<CacheProvider value={emotionCache}>
				<Head>
					<meta
						name="viewport"
						content="initial-scale=1, width=device-width"
					/>
				</Head>
				<ThemeProvider theme={theme}>
					{/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
					<CssBaseline />
					<Component {...pageProps} />
				</ThemeProvider>
			</CacheProvider>
		</SessionProvider>
	);
}

MyApp.propTypes = {
	Component: PropTypes.elementType.isRequired,
	emotionCache: PropTypes.object,
	pageProps: PropTypes.object.isRequired,
};
```

## Edit file index.js

Edit file `index.js` menjadi sebagai berikut :

```javascript
import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useRouter } from "next/dist/client/router";
import { signOut, useSession, getSession } from "next-auth/react";

// export default function Index(props) {
export default function Index() {
	const { data: session } = useSession();
	const router = useRouter();

	return (
		<Container maxWidth="lg">
			<Box
				sx={{
					my: 4,
					p: 2,
					borderRadius: "10px",
					backgroundColor: "background.paper",
				}}
			>
				<Typography variant="h6" component="h1" gutterBottom>
					Halaman Utama yang diproteksi
				</Typography>
				{session ? (
					<button onClick={() => signOut()}>Log out</button>
				) : (
					<button
						onClick={() => {
							router.push("/auth/login");
						}}
					>
						Sign in
					</button>
				)}
			</Box>
		</Container>
	);
}

export async function getServerSideProps(context) {
	// session bernilai NULL jika user not authenticated
	const session = await getSession({ req: context.req });
	// jika bernilai NULL, redirect ke halaman login
	if (!session) {
		return {
			redirect: {
				destination: "/auth/login",
				permanent: false,
			},
		};
	}

	return {
		props: {
			...session,
		},
	};
}
```

## Pembuatan folder pages/auth

Buat folder `auth` di dalam folder `pages`, kemudian buat sebuah file dengan nama `login.js` yang isinya adalah sbb :

```javascript
import { signIn } from "next-auth/react";
import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useRouter } from "next/router";

function Login() {
	const router = useRouter();

	async function handleSubmit(event) {
		event.preventDefault();

		const data = new FormData(event.currentTarget);
		// provider nya : credentials
		const result = await signIn("credentials", {
			redirect: false,
			username: data.get("username"),
			password: data.get("password"),
		});

		if (!result.error) {
			router.replace("/");
		} else {
			alert("user atau password salah");
		}
	}

	return (
		<Container component="main" maxWidth="xs">
			<Box
				sx={{
					marginTop: 8,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Typography component="h1" variant="h5">
					Login
				</Typography>
				<Box
					component="form"
					onSubmit={handleSubmit}
					noValidate
					sx={{ mt: 1 }}
				>
					<TextField
						margin="normal"
						required
						fullWidth
						id="username"
						label="User Name"
						name="username"
						autoFocus
					/>
					<TextField
						margin="normal"
						required
						fullWidth
						name="password"
						label="Password"
						type="password"
						id="password"
						autoComplete="current-password"
					/>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						sx={{ mt: 3, mb: 2 }}
					>
						Sign In
					</Button>
				</Box>
			</Box>
		</Container>
	);
}
export default Login;
```

Kemudian akses ke URL : http://localhost:3000

Dalam file `index.js` ada pemeriksaan session. Jika belum pernah login, maka akan diarahkan ke halaman login

Isikan sembarang dulu user dan passwordnya untuk pengujian, harusnya muncul error.
Kemudian isikan user dan password di bawah ini

```bash
user name : admin
Pass : test
```

Jika berhasil login maka akan muncul halaman utama dengan tulisan `Halaman Utama yang diproteksi`

Contoh di atas adalah contoh simple menggunakan data yang tetap. Sekarang kita akan coba user dan password nya ambil dari database.

## Install BCRYPT

Bcrypt digunakan untuk enkripsi dan pengecekan HASH.

```
npm install bcryptjs
```

## Buat file untuk enkripsi

Buat file baru dengan namafile `auth.js` di folder `lib`. Isi nya adalah sebagai berikut :

```javascript
import { hash, compare } from "bcryptjs";

export async function hashPassword(password) {
	const hashedPassword = await hash(password, 12);
	return hashedPassword;
}

export async function verifyPassword(password, hashedPassword) {
	const isValid = await compare(password, hashedPassword);
	return isValid;
}
```

## Pengaturan jsconfig.json

Tambahkan baris berikut pada `path` di file `jsconfig.json`

```
"@lib/*": ["lib/*"]
```

sehingga isi file `jsconfig.json` nya adalah sebagai berikut

```javascript
{
	"compilerOptions": {
		"baseUrl": ".",
		"paths": {
			"@lib/*": ["lib/*"]
		}
	}
}
```

hal ini untuk memudahkan penulisan import dari folder lib.
Sebagai contoh adalah sebagai berikut :

```javascript
import { verifyPassword } from "@lib/auth";
import prisma from "@lib/prisma";
```

Kemudian edit file `[...nextauth].js` menjadi berikut :

```javascript
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
```

Untuk Login-nya menggunakan data berikut sesuai dengan database

```
User : chandra
Password : Initial123#
```
