import type { Metadata } from 'next'
import { Host_Grotesk, Geist_Mono } from 'next/font/google'
import './globals.css'

const hostGrotesk = Host_Grotesk({
  variable: '--font-host-grotesk',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Waypoint — Live Support Co-browsing via WebMCP',
  description:
    'Structured, schema-driven mirror of live customer pages. Rep proposes actions, customer confirms, execution stays local.',
}

type RootLayoutProps = {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang='en'
      className={`${hostGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className='min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-black selection:text-white'>
        {children}
      </body>
    </html>
  )
}
