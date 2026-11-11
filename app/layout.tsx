import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "LabSign Verify", description: "Laboratory issuance-date authorization verification" };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
