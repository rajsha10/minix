import type { Metadata } from "next";
import { AuthContextProvider } from "./context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Minix",
  description: "A mini games telegram app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}
