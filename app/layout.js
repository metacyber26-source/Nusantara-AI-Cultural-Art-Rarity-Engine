import "./globals.css";

export const metadata = {
  title: "Nusantara AI Cultural Art & Rarity Engine",
  description: "Preservasi Budaya Nusantara, Evaluasi Rarity NFT, & Analisis Semiotika AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
