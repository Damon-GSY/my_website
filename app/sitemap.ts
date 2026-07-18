import type { MetadataRoute } from 'next'
import { notes, profile, work } from '@/lib/content'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: profile.siteUrl,
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...work.map((project) => ({
      url: `${profile.siteUrl}/work/${project.id}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    {
      url: `${profile.siteUrl}/notes`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...notes.map((note) => ({
      url: `${profile.siteUrl}/notes/${note.slug}`,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ]
}
