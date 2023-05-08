import './globals.css'
import { Inter } from 'next/font/google'
import React from "react";
import SideBar from "./SideBar";
import classNames from "@/helpers/class-name.helper";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Magic Tools',
  description: 'Des outils pour MTG',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-white">
      <body className={classNames(inter.className, 'h-full')}>
        <SideBar children={children} />
      </body>
    </html>
  )
}
