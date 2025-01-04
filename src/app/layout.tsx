import React from "react";
import { Metadata } from 'next';

export const metadata:Metadata= {
	title : "Chess"
}
export default function RootLayout({children,}:{children: React.ReactNode}){
	return(
		<>
			<html lang="en">
			<head>
        {/* Preloading audio files */}
        <link rel="preload" href="/sounds/capture.mp3" as="fetch" crossOrigin="anonymous"/>
        <link rel="preload" href="/sounds/castle.mp3" as="fetch" crossOrigin="anonymous"/>
        <link rel="preload" href="/sounds/game-end.webm" as="fetch" crossOrigin="anonymous"/>
        <link rel="preload" href="/sounds/illegal.mp3" as="fetch" crossOrigin="anonymous"/>
        <link rel="preload" href="/sounds/move-check.mp3" as="fetch" crossOrigin="anonymous"/>
        <link rel="preload" href="/sounds/move-opponent.mp3" as="fetch" crossOrigin="anonymous"/>
        <link rel="preload" href="/sounds/move-self.mp3" as="fetch" crossOrigin="anonymous"/>
        <link rel="preload" href="/sounds/promote.mp3" as="fetch" crossOrigin="anonymous"/>
      </head>
			<body>
				<div id="root">
					{children}
				</div>
			</body>
			</html>
		</>
	);
}