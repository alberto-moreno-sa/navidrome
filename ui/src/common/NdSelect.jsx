import React, { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

// Small styled dropdown (button + popover list). Accessible: real buttons,
// outside-click and Escape close it, the popover is sized against its anchor.
const NdSelect = ({ value, options, onChange, icon, placeholder = 'Seleccionar', ariaLabel }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="nd-select" ref={ref}>
      <button
        className="nd-select-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        {icon ? <Icon name={icon} size={16} className="nd-icon" /> : null}
        <span className="nd-trunc">{current ? current.label : placeholder}</span>
        <Icon name={open ? 'collapse' : 'expandMore'} size={16} className="nd-icon" />
      </button>
      {open ? (
        <div className="nd-select-menu" role="listbox">
          {options.map((o) => (
            <button
              key={o.value == null ? '__all' : o.value}
              className={`nd-select-item${o.value === value ? ' on' : ''}`}
              role="option"
              aria-selected={o.value === value}
              onClick={() => {
                onChange(o.value)
                setOpen(false)
              }}
              type="button"
            >
              <span className="nd-trunc">{o.label}</span>
              {o.value === value ? <Icon name="check" size={16} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default NdSelect
