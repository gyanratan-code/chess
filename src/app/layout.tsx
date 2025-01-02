import React from "react";
import { Metadata } from 'next';

export const metadata:Metadata= {
	title : "Chess"
}
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