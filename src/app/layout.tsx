import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { UserProvider } from "@/contexts/user-context";
import { ThemeProvider } from "@/contexts/theme-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GDG Scheduler — 會議排程工具",
  description: "GDG Discord 社群的 When2Meet 風格會議排程工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        {/* 阻斷式腳本：在首次繪製前就套用正確 theme class，消除 FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var theme=(t==='dark'||t==='light')?t:(d?'dark':'light');document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(theme);}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={cn(geistSans.variable, geistMono.variable, "antialiased bg-background text-foreground")}
      >
        <ThemeProvider>
          <UserProvider>
            <AppSidebar>{children}</AppSidebar>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
