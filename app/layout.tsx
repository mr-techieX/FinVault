import type { Metadata } from "next";
import { Poppins, Orbitron } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { headers } from "next/headers";
import "./globals.css";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FinVault — Personal Finance & Net Worth Platform",
  description:
    "Track your net worth, manage loans, investments, budgets and goals. Free personal finance management with automatic calculations.",
  keywords: [
    "personal finance",
    "net worth tracker",
    "budget tracker",
    "investment tracker",
    "loan amortization",
    "XIRR calculator",
  ],
  authors: [{ name: "FinVault" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    title: "FinVault — Personal Finance & Net Worth Platform",
    description:
      "Track your net worth, manage loans, investments, budgets and goals.",
    siteName: "FinVault",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || undefined;

  return (
    <html lang="en" className={`${poppins.variable} ${orbitron.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-br from-indigo-50/40 via-background to-purple-50/40 dark:from-indigo-950/30 dark:via-background dark:to-emerald-950/20 font-poppins antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <div className="fixed bottom-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

