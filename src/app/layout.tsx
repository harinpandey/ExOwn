import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CompareProvider } from "@/context/CompareContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import CompareBar from "@/components/layout/CompareBar";
import { NotificationProvider } from "@/context/NotificationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExOwn – Exchange. Own. Repeat.",
  description: "ExOwn is a student marketplace platform for exchange, ownership, reuse, and circular commerce.",
  icons: {
    icon: "/exown-icon.png",
    apple: "/exown-icon.png",
  },
};

import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <NotificationProvider>
              <CompareProvider>
                <Toaster position="top-center" reverseOrder={false} />
                <ClientLayoutWrapper>
                  <Navbar />
                  <main className="flex-1 pb-16 md:pb-0 page-transition">
                    {children}
                  </main>
                  <Footer />
                  <MobileNav />
                  <CompareBar />
                </ClientLayoutWrapper>
              </CompareProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </body>
    </html>
  );
}
