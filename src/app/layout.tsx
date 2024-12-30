// app/layout.tsx
import type { Metadata } from "next";
import { AuthContextProvider } from "./context/AuthContext";
import { TelegramViewport } from "./components/TelegramViewport";
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
          <TelegramViewport>
            {children}
          </TelegramViewport>
        </AuthContextProvider>
      </body>
    </html>
  );
}