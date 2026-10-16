// Brandfetch logo URL builder.
// Requires VITE_BRANDFETCH_CLIENT_ID in your .env file.
// Sign up at https://developers.brandfetch.com to get a client ID.

const CLIENT_ID = import.meta.env.VITE_BRANDFETCH_CLIENT_ID

export function getLogoUrl(websiteOrDomain) {
  if (!websiteOrDomain || !CLIENT_ID) return null

  const domain = String(websiteOrDomain)
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .trim()
    .toLowerCase()

  if (!domain) return null

  return `https://cdn.brandfetch.io/${domain}?c=${CLIENT_ID}`
}

// Account-aware fallback colors when no logo is available.
// Ensures Netflix-as-NF reads the same color everywhere it appears.
const ACCOUNT_FALLBACK = {
  personal: { bg: 'rgba(83, 74, 183, 0.10)',  fg: '#534AB7' },
  work:     { bg: 'rgba(186, 117, 23, 0.10)', fg: '#BA7517' },
  school:   { bg: 'rgba(29, 158, 117, 0.10)', fg: '#1D9E75' },
}

export function getFallbackColors(sub) {
  if (sub.logoBg && sub.logoFg) {
    return { bg: sub.logoBg, fg: sub.logoFg }
  }
  return ACCOUNT_FALLBACK[sub.accountType?.toLowerCase()] || {
    bg: 'rgba(138, 139, 149, 0.10)',
    fg: '#5A5A64',
  }
}