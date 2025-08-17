import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./anti-flicker.css";
import "./globals.css";
import OptimizedCosmicBackground from "@/components/effects/OptimizedCosmicBackground";
import ClientOnly from "@/components/effects/ClientOnly";
import ClientOnlyAuthProvider from "@/components/auth/ClientOnlyAuthProvider";
import { HydrationProvider } from "@/components/hydration/HydrationProvider";
import LazyMotion from "@/components/hydration/LazyMotion";
import CosmicCompanion from "@/components/ui/CosmicCompanion";
import DebugMenu from "@/components/debug/DebugMenu";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "OBELISK - Learn with Clarity",
  description: "Revolutionary educational platform driven by The Clear Name Principle. Journey through the cosmos of knowledge as a Singularity, guided by cosmic NPCs.",
  keywords: "education, learning, clear concepts, gamified learning, cosmic education",
  authors: [{ name: "OBELISK Team" }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent FOUC and flickering
              document.documentElement.style.visibility = 'visible';
              document.documentElement.classList.add('preload');
              window.addEventListener('load', function() {
                requestAnimationFrame(function() {
                  document.documentElement.classList.remove('preload');
                });
              });
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-cosmic antialiased min-h-screen bg-gradient-to-b from-gray-900 via-blue-950 to-purple-950 preload`} suppressHydrationWarning>
        <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-blue-950 to-purple-950" />
        <ClientOnly>
          <OptimizedCosmicBackground intensity="low" />
        </ClientOnly>
        
        <HydrationProvider totalComponents={20}>
          <LazyMotion>
            <ClientOnlyAuthProvider>
              <div className="relative z-10">
                {children}
              </div>
              <ClientOnly>
                <CosmicCompanion />
              </ClientOnly>
              <ClientOnly>
                <DebugMenu />
              </ClientOnly>
            </ClientOnlyAuthProvider>
          </LazyMotion>
        </HydrationProvider>
      </body>
    </html>
  );
}