const DEFAULT_LOCAL_API_URL = 'http://localhost:3000'
const DEFAULT_PUBLIC_API_URL = 'https://aquaviina.md/api'

const fallbackBaseUrl = import.meta.env.MODE === 'production'
  ? DEFAULT_PUBLIC_API_URL
  : DEFAULT_LOCAL_API_URL

export const API_BASE_URL =
  (typeof import.meta.env.VITE_API_BASE_URL === 'string' && import.meta.env.VITE_API_BASE_URL.trim().length > 0
    ? import.meta.env.VITE_API_BASE_URL
    : fallbackBaseUrl)
