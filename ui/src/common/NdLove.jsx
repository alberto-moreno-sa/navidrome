import React, { useEffect, useState } from 'react'
import Icon from './Icon'
import { useToggleLove } from './useToggleLove'

// Favorite (love) button wired to the sanctioned data layer (useToggleLove →
// subsonic star/unstar + dataProvider refresh). Optimistic fill defers back to
// the real record.starred once the refresh lands. Amber marks the active state
// (allowed: playback/editorial state, per the inventory).
const NdLove = ({ resource, record, size = 18, className = '', stop = true, label, labelOn }) => {
  const [toggleLove, loading] = useToggleLove(resource, record)
  const [optim, setOptim] = useState(null)
  const starred = !!(record && record.starred)

  // Once the store catches up, drop the optimistic override.
  useEffect(() => {
    setOptim(null)
  }, [starred])

  if (!record || !record.id) return null
  const loved = optim != null ? optim : starred

  const onClick = (e) => {
    if (stop) {
      e.preventDefault()
      e.stopPropagation()
    }
    setOptim(!loved)
    toggleLove()
  }

  const text = label ? (loved ? labelOn || label : label) : null

  return (
    <button
      className={`${label ? 'nd-love-btn' : 'nd-love'}${loved ? ' on' : ''}${className ? ` ${className}` : ''}`}
      aria-label={loved ? 'Quitar de favoritos' : 'Marcar favorito'}
      aria-pressed={loved}
      onClick={onClick}
      disabled={loading}
      type="button"
    >
      <Icon name={loved ? 'heartFilled' : 'heart'} size={size} fill={loved} />
      {text ? <span>{text}</span> : null}
    </button>
  )
}

export default NdLove
