import React, { useEffect, useState } from 'react'
import Icon from './Icon'
import { useRating } from './useRating'

// Interactive 5-star rating wired to useRating (subsonic setRating + refresh).
// Hover previews, click sets; clicking the current value clears it. Optimistic
// value defers to record.rating once the refresh lands. Amber = editorial state.
const NdStars = ({ resource, record, size = 16, className = '', stop = true }) => {
  const [rate, rating, loading] = useRating(resource, record)
  const [hover, setHover] = useState(0)
  const [optim, setOptim] = useState(null)

  useEffect(() => {
    setOptim(null)
  }, [rating])

  if (!record || !record.id) return null
  const value = optim != null ? optim : rating || 0
  const shown = hover || value

  const set = (val) => (e) => {
    if (stop) {
      e.preventDefault()
      e.stopPropagation()
    }
    const next = val === value ? 0 : val
    setOptim(next)
    rate(next, record.id)
  }

  return (
    <span
      className={`nd-stars${className ? ` ${className}` : ''}`}
      onMouseLeave={() => setHover(0)}
      role="radiogroup"
      aria-label="Valoración"
    >
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          type="button"
          className={`nd-star${v <= shown ? ' on' : ''}`}
          aria-label={`${v} ${v === 1 ? 'estrella' : 'estrellas'}`}
          disabled={loading}
          onMouseEnter={() => setHover(v)}
          onClick={set(v)}
        >
          <Icon name="star" size={size} fill={v <= shown} />
        </button>
      ))}
    </span>
  )
}

export default NdStars
