import type { Metadata } from 'next'
import EmotionRegistry from './emotion-registry'
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
        <EmotionRegistry>
          <Providers>{children}</Providers>
        </EmotionRegistry>
      </body>
    </html>
  )
}
