import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import ChatProvider from "@/components/chat-provider"
import PlayerProvider from "@/components/player-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mafia Game Learning",
  description: "Learn the Mafia game with an AI agent",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <PlayerProvider>
            <ChatProvider>
              <div className="flex flex-col h-full">
                <Header />
                <main className="flex-1 flex overflow-hidden">{children}</main>
              </div>
            </ChatProvider>
          </PlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
