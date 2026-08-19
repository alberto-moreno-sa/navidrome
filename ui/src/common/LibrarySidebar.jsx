import React from 'react'
import Icon from './Icon'

// Library sidebar (width 200, collapses to a 56px icon rail). Rows are 34 tall
// with an 18px icon, a 14/500 label, and a right-aligned count. The active row
// turns white. When collapsed, labels and counts hide and each row keeps a
// title tooltip for accessibility.
const VIEWS = [
  { key: 'all', label: 'All', icon: 'all' },
  { key: 'albums', label: 'Albums', icon: 'album' },
  { key: 'artists', label: 'Artists', icon: 'artist' },
  { key: 'songs', label: 'Songs', icon: 'song' },
  { key: 'playlists', label: 'Playlists', icon: 'playlist' },
  { key: 'genres', label: 'Genres', icon: 'genre' },
  { key: 'radios', label: 'Radios', icon: 'radio' },
  { key: 'favorites', label: 'Favorites', icon: 'heart' },
  { key: 'shares', label: 'Shared', icon: 'share' },
]

const fmtCount = (n) => {
  if (n == null) return ''
  if (n > 9999) return `${Math.round(n / 1000)}k`
  if (n > 999) return `${(n / 1000).toFixed(1)}k`
  return `${n}`
}

const LibrarySidebar = ({ view, onSelect, counts = {}, collapsed, onToggle }) => (
  <nav
    className={`nd-sidebar${collapsed ? ' collapsed' : ''}`}
    aria-label="Library"
  >
    <button
      className="nd-sidebar-toggle"
      onClick={onToggle}
      aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
      aria-expanded={!collapsed}
      type="button"
    >
      <Icon name={collapsed ? 'expand' : 'collapse'} size={18} />
    </button>
    {VIEWS.map((v) => (
      <a
        key={v.key}
        href="#"
        className={view === v.key ? 'on' : ''}
        title={collapsed ? v.label : undefined}
        aria-label={v.label}
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
