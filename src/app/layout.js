import "./globals.css";
import { Montserrat_Alternates, KoHo } from "next/font/google";

const heading = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["600","700"],
  variable: "--font-heading",
});

const body = KoHo({
  subsets: ["latin"],
  weight: ["400","500"],
  variable: "--font-body",
});

export const metadata = {
  title: {
    default: "Sistem Absensi Siswa",
    template: "%s",
  },
  description: "Aplikasi sistem absensi siswa untuk memudahkan pencatatan kehadiran siswa secara digital. Dengan fitur-fitur seperti absensi harian, laporan kehadiran, dan notifikasi, aplikasi ini membantu sekolah dalam mengelola absensi dengan lebih efisien dan akurat.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="font-body bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}