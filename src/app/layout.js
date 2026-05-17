import "./globals.css";

export const metadata = {
  title: "Instayt Super Admin Console",
  description: "Professional control panel for Instayt backend administration, moderation, and operations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
