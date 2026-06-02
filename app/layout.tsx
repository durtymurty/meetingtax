import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeetingTax — See the real cost of your meetings",
  description: "Track the true dollar cost of every meeting in real time. Powered by AI analysis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}