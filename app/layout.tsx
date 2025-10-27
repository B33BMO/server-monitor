// app/layout.tsx
export const metadata = {
  title: "Cyburity Server Monitor",
  description: "All your shit. Hopefully green.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#0b0e14] text-[#e6e7ee]">
      <body className="min-h-screen bg-[radial-gradient(circle_at_50%_-10%,rgba(0,255,174,0.08)_0%,rgba(0,0,0,0)_60%),linear-gradient(180deg,#0b0e14_0%,#141821_100%)] text-[#e6e7ee] antialiased">
        <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8 space-y-4">
          {children}
        </div>
      </body>
    </html>
  );
}
