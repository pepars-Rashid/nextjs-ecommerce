export const metadata = {
  title: 'NextCommerce',
  description: 'Next.js E-commerce template',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        {children}
      </body>
    </html>
  );
} 