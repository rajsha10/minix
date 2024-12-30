// app/layout.tsx
import type { Metadata } from "next";
import { AuthContextProvider } from "./context/AuthContext";
import { TelegramViewportHandler } from "./components/TelegramViewportHandler";
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
          <TelegramViewportHandler>
            {children}
          </TelegramViewportHandler>
        </AuthContextProvider>
      </body>
    </html>
  );
}