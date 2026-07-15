import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { OAuthResultToast } from "@/components/auth/OAuthResultToast";
import { Toaster } from "@/components/ui/toast";
import { JsonLd } from "@/components/JsonLd";
import { BASE_URL } from "@/config/config";
import { getCurrentUser } from "@/lib/auth";
import { AuthProvider } from "@/providers/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Openmap.lt – Atviras Lietuvos žemėlapis",
    template: "%s – Openmap.lt",
  },
  description: "Atviras Lietuvos žemėlapis",
  openGraph: {
    type: "website",
    siteName: "Openmap.lt",
    locale: "lt_LT",
    url: BASE_URL,
    title: "Openmap.lt – Atviras Lietuvos žemėlapis",
    description: "Atviras Lietuvos žemėlapis",
    images: [
      {
        url: "/logo/openmap-icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Openmap.lt",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Openmap.lt – Atviras Lietuvos žemėlapis",
    description: "Atviras Lietuvos žemėlapis",
    images: ["/logo/openmap-icon-512x512.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="lt" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}
      >
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Openmap.lt",
            alternateName: "Atviras Lietuvos žemėlapis",
            url: BASE_URL,
            inLanguage: "lt",
          }}
        />
        <Toaster />
        <AuthProvider initialUser={currentUser}>
          {children}
          <OAuthResultToast />
        </AuthProvider>
      </body>
    </html>
  );
}
