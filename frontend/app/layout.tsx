import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "./components/sidebar"
import { Header } from "./components/header"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Farm Smart Home Dashboard",
  description: "Control your smart farm with ease",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col md:flex-row h-screen bg-[#f9f7f3]">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-4">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}

