/**
 * FontLoader Component
 *
 * Renders link elements for optimal Google Fonts loading with preconnect optimization
 */

import type { FontLoaderProps } from './types'

/**
 * Renders optimized link elements for loading external fonts
 *
 * Best practices implemented:
 * - Preconnect to font CDN domains for DNS/TLS optimization
 * - Proper CORS handling for cross-origin requests
 * - Stylesheet loading with display=swap for better UX
 *
 * @example
 * ```tsx
 * const links = [
 *   { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
 *   { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
 *   { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=...' }
 * ]
 *
 * <FontLoader links={links} />
 * ```
 */
export function FontLoader({ links }: FontLoaderProps) {
  return (
    <>
      {links.map((link, index) => (
        <link
          key={`font-link-${index}`}
          rel={link.rel}
          href={link.href}
          {...(link.crossOrigin && { crossOrigin: link.crossOrigin })}
          {...(link.media && { media: link.media })}
        />
      ))}
    </>
  )
}