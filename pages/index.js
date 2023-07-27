import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useRouter } from "next/dist/client/router";
import { signOut, getSession } from "next-auth/react";

export default function Index(props) {
	const router = useRouter();
	const session = props.user;

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

	const hasil = 1;
	return {
		props: {
			...session,
		},
	};
}
