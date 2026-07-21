import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { profile, research, socials } from '@/lib/content'
import './globals.css'
import './mobile-excellence.css'

const cartograph = localFont({
  variable: '--font-cartograph',
  display: 'swap',
  src: [
    {
      path: '../public/fonts/CartographCF-ExtraLight.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../public/fonts/CartographCF-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/CartographCF-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
})

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: `${profile.name} — Agent Systems, Under Control`,
  description:
    `${profile.name} is an LLM algorithm engineer at ${profile.company} building reliable agent systems, agentic RL, post-training pipelines, and multi-turn evaluation.`,
  authors: [{ name: profile.name, url: profile.siteUrl }],
  creator: profile.name,
  icons: {
    icon: '/favicon.svg',
  },
  keywords: ['LLM agents', 'agentic RL', 'post-training', 'LLM evaluation', 'AI systems'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: `${profile.name} — Agent Systems, Under Control`,
    description:
      `Production agent systems, post-training, and evaluation research by ${profile.name}.`,
    siteName: profile.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${profile.name} — Agent Systems, Under Control`,
    description: 'Production agent systems, post-training, and evaluation research.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#08090c',
  colorScheme: 'dark',
}

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${profile.siteUrl}/#person`,
  name: profile.name,
  additionalName: profile.legalName,
  alternateName: profile.alternateNames,
  url: profile.siteUrl,
  email: profile.email,
  jobTitle: profile.role,
  worksFor: {
    '@type': 'Organization',
    name: profile.company,
  },
  sameAs: socials.map(([, url]) => url),
  subjectOf: research.map((paper) => ({
    '@type': 'ScholarlyArticle',
    '@id': paper.href,
    name: paper.title,
    url: paper.href,
    datePublished: paper.year.slice(0, 4),
    author: { '@id': `${profile.siteUrl}/#person` },
    isPartOf: {
      '@type': 'CreativeWorkSeries',
      name: paper.venue,
    },
  })),
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cartograph.variable}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </body>
    </html>
  )
}
