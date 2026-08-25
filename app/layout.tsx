import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bicicletas Juan Diego | Popayán | Taller y Almacén",
  description: "Tienda virtual y taller especializado en bicicletas de ruta, MTB, repuestos y accesorios en Popayán. Calle 13 # 8-16.",
  keywords: ["bicicletas", "taller", "Popayán", "repuestos", "ciclismo", "GW", "Shimano", "Venzo"],
  authors: [{ name: "Bicicletas Juan Diego" }],
  openGraph: {
    title: "Bicicletas Juan Diego | Popayán",
    description: "Taller técnico y almacén de repuestos, cascos, calzado y accesorios para ciclismo.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
