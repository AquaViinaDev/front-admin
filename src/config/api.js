const DEFAULT_PUBLIC_API_URL = 'https://aquaviina.md/api'

const isLocalHostUrl = (value) => {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return false
  try {
    const parsed = new URL(trimmed, 'http://localhost')
    const hostname = parsed.hostname.toLowerCase()
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
  } catch {
    return /(?:^|[/:])(?:localhost|127\\.0\\.0\\.1|::1)(?:$|[/:])/i.test(trimmed)
  }
}

const fallbackBaseUrl = DEFAULT_PUBLIC_API_URL

const rawEnvBaseUrl =
  (typeof import.meta.env.VITE_API_BASE_URL === 'string' && import.meta.env.VITE_API_BASE_URL.trim().length > 0
    ? import.meta.env.VITE_API_BASE_URL
    : '')

const usePublicFallback =
  import.meta.env.MODE === 'production' && rawEnvBaseUrl && isLocalHostUrl(rawEnvBaseUrl)

export const API_BASE_URL = usePublicFallback || !rawEnvBaseUrl
  ? fallbackBaseUrl
  : rawEnvBaseUrl

export const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin
  } catch {
    return API_BASE_URL
  }
})()
