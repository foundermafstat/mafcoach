import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/header';
import ChatProvider from '@/components/chat-provider';
import PlayerProvider from '@/components/player-provider';
import ReplicaProvider from '@/components/replica-provider';
import ResizablePanel from '@/components/resizable-panel';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'MafCoach',
	description: 'Learn the Mafia game with an AI agent',
	icons: {
		icon: '/favicon.ico', // или путь к .png/.svg, если используешь другой формат
	},
};

import { HeaderProvider } from '@/components/header-context'

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="h-full dark">
			<body className={`${inter.className} h-full bg-[#121316]`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem={false}
					disableTransitionOnChange
				>
					<HeaderProvider>
						<PlayerProvider>
							<ReplicaProvider>
								<ChatProvider>
								{/* Special handling for lobby page */}
								{typeof window !== 'undefined' && window.location.pathname.includes('/lobby') ? (
									<main className="flex-1">{children}</main>
								) : (
									<div className="flex flex-col h-full">
										<Header />
										<main className="flex-1 flex overflow-hidden">
											<ResizablePanel>
												{children}
											</ResizablePanel>
										</main>
									</div>
								)}
								</ChatProvider>
							</ReplicaProvider>
						</PlayerProvider>
					</HeaderProvider>
				</ThemeProvider>
				{/* <Script 
					src="https://chat-widget.sensay.io/b4d138ab-41ad-4830-b193-166db4d5b124/embed-script.js" 
					strategy="afterInteractive"
				/> */}
			</body>
		</html>
	);
}
