import "./globals.css";

export const metadata = {
  title: "CopyAI Pro — AI Copywriting Assistant for Freelancers",
  description:
    "Generate headlines, emails, and manage your swipe file. Built for freelance copywriters and designers who bill by the project, not the hour.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-ink-900 text-white antialiased">{children}</body>
    </html>
  );
}
