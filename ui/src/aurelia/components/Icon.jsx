import React from 'react'

// Stroke icons from the design reference: viewBox 24, currentColor, stroke-width
// 1.8, rounded caps/joins. play/prev/next/kebab are filled (stroke none).
// Sizes: 14 inline with small text, 18 default, 20 transport, 26 main play.
const PATHS = {
  back: <path d="M15 18l-6-6 6-6" />,
  forward: <path d="M9 18l6-6-6-6" />,
  chevron: <path d="M9 18l6-6-6-6" />,
  discover: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  library: (
    <>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M7 6V4h10v2M8 13h8" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  sparkle: <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10l1.4 1.4m0-12.8l-1.4 1.4m-10 10l-1.4 1.4" />
    </>
  ),
  moon: <path d="M20 14a8 8 0 01-10-10 8 8 0 1010 10z" />,
  system: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 010 16z" fill="currentColor" stroke="none" />
    </>
  ),
  account: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0114 0" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <path d="M7 10h.01M11 10h.01M15 10h.01M8 14h8" />
    </>
  ),
  support: (
    <>
      <path d="M4 14v-2a8 8 0 0116 0v2" />
      <rect x="2.5" y="13" width="4" height="6" rx="2" />
      <rect x="17.5" y="13" width="4" height="6" rx="2" />
    </>
  ),
  starOutline: <path d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z" />,
  star: <path d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z" fill="currentColor" stroke="none" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V21a2 2 0 11-4 0v-.1A1.6 1.6 0 006 19.4l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 003 13.9H3a2 2 0 110-4h.1A1.6 1.6 0 004.6 6l-.1-.1a2 2 0 112.8-2.8l.1.1A1.6 1.6 0 0010 3.1V3a2 2 0 114 0v.1a1.6 1.6 0 002.7 1.1l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 001.1 2.7H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1.3z" />
    </>
  ),
  logout: <path d="M15 17l5-5-5-5M20 12H9M13 3H6a2 2 0 00-2 2v14a2 2 0 002 2h7" />,
  filter: (
    <>
      <path d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h12M20 17h0" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="18" cy="17" r="2" />
    </>
  ),
  sliders: <path d="M4 7h16M4 12h16M4 17h16" />,
  award: <path d="M8 4c-2 4-2 8 4 12M16 4c2 4 2 8-4 12M12 16v4M9 20h6" />,
  play: <path d="M7 5l12 7-12 7z" fill="currentColor" stroke="none" />,
  pause: <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" stroke="none" />,
  kebab: (
    <>
      <circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  heart: <path d="M12 20s-7-4.4-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.6-7 9-7 9z" />,
  heartFilled: <path d="M12 20s-7-4.4-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.6-7 9-7 9z" fill="currentColor" stroke="none" />,
  shuffle: <path d="M16 4l3 3-3 3M16 14l3 3-3 3M4 7h4l8 10h3M4 17h4l2-2.5M14 9.5L16 7h3" />,
  prev: <path d="M11 12l7-5v10zM4 12l7-5v10z" fill="currentColor" stroke="none" />,
  next: <path d="M13 12L6 7v10zM20 12l-7-5v10z" fill="currentColor" stroke="none" />,
  repeat: <path d="M4 12a5 5 0 015-5h10l-3-3M20 12a5 5 0 01-5 5H5l3 3" />,
  volume: <path d="M5 9v6h3l4 4V5L8 9zM16 9a4 4 0 010 6" />,
  output: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <circle cx="12" cy="14" r="3" />
      <path d="M12 7h.01" />
    </>
  ),
  queue: <path d="M4 7h11M4 12h11M4 17h7M17 10v7M17 10l4-1" />,
  history: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  expand: <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3m13-5v3a2 2 0 01-2 2h-3" />,
  collapse: <path d="M9 3v3a2 2 0 01-2 2H4m16 0h-3a2 2 0 01-2-2V3M4 16h3a2 2 0 012 2v3m9 0v-3a2 2 0 012-2h3" />,
  add: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  external: <path d="M14 4h6v6M20 4l-9 9M18 13v5a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h5" />,
}

export const Icon = ({ name, size = 18, className, ...rest }) => {
  const path = PATHS[name]
  if (!path) return null
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {path}
    </svg>
  )
}

export default Icon
