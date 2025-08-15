export const metadata = {
  title: 'SoloBoss AI',
  description: 'SoloBoss AI Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}