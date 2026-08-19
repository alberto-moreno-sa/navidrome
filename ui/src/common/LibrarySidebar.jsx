import React from 'react'
import Icon from './Icon'

// Library sidebar (width 200, collapses to a 56px icon rail below 1080). Rows
// are 34 tall with an 18px icon, a 14/500 label, and a right-aligned count.
// The active row turns white.
const VIEWS = [
  { key: 'all', label: 'Todo', icon: 'library' },
  { key: 'albums', label: 'Álbumes', icon: 'library' },
  { key: 'artists', label: 'Artistas', icon: 'account' },
  { key: 'songs', label: 'Canciones', icon: 'queue' },
  { key: 'playlists', label: 'Listas', icon: 'queue' },
  { key: 'genres', label: 'Géneros', icon: 'sliders' },
  { key: 'radios', label: 'Radios', icon: 'discover' },
  { key: 'favorites', label: 'Favoritos', icon: 'heart' },
  { key: 'shares', label: 'Compartidos', icon: 'external' },
]

const fmtCount = (n) => {
  if (n == null) return ''
  if (n > 9999) return `${Math.round(n / 1000)}k`
  if (n > 999) return `${(n / 1000).toFixed(1)}k`
  return `${n}`
}

const LibrarySidebar = ({ view, onSelect, counts = {} }) => (
  <nav className="nd-sidebar" aria-label="Biblioteca">
    {VIEWS.map((v) => (
      <a
        key={v.key}
        href="#"
        className={view === v.key ? 'on' : ''}
        onClick={(e) => {
          e.preventDefault()
          onSelect(v.key)
        }}
      >
        <Icon name={v.icon} size={18} />
        <span className="lbl">{v.label}</span>
        <span className="cnt">{fmtCount(counts[v.key])}</span>
      </a>
    ))}
  </nav>
)

export { VIEWS }
export default LibrarySidebar
