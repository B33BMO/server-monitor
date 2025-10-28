import "./globals.css";

export const metadata = {
  title: "Cyburity Server Monitor",
  description: "Central nervous system of the chaos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen text-[var(--text-main)]">
        <div className="">
          {children}
        </div>
      </body>
    </html>
  );
}
