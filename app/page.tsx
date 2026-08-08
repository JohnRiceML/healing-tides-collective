import type {Metadata} from 'next'

import ImmersiveScrollDesign from './HomePageClient'
import {SITE_URL} from '@/lib/site'

export const metadata: Metadata = {
  alternates: {canonical: `${SITE_URL}/`},
}

export default function HomePage() {
  return <ImmersiveScrollDesign />
}
