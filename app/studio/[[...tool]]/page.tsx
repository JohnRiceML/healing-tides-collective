'use client'

/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * NextStudio touches `window` during render, so it must not be server-rendered.
 * `ssr: false` requires this file to be a Client Component; metadata/viewport
 * therefore live in the sibling layout file.
 */

import nextDynamic from 'next/dynamic'
import config from '../../../sanity.config'

const NextStudio = nextDynamic(
  () => import('next-sanity/studio').then((m) => m.NextStudio),
  { ssr: false },
)

export default function StudioPage() {
  return <NextStudio config={config} />
}
