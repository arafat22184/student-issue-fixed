import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { Providers } from "./Providers";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Wisperia",
  description: "Wisperia - Your AI friend",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`} suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          <main className="">
            {children}
            <Toaster position="top-center" reverseOrder={false} />
          </main>

          <Footer />
        </Providers>
      </body>
    </html>
  );
}
