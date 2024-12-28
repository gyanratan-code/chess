import React from "react";

export default function RootLayout({children,}:{children: React.ReactNode}){
	return(
		<>
			<html lang="en"></html>
			<body>
				<div id="root">
					{children}
				</div>
			</body>
		</>
	);
}