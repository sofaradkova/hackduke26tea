import type { Metadata } from 'next'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'ClassWatch — Teacher Dashboard',
  description: 'AI-powered classroom monitoring for real-time student support',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
