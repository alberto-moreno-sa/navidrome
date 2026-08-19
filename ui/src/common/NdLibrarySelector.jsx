import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useDataProvider, useRefresh } from 'react-admin'
import { setSelectedLibraries, setUserLibraries } from '../actions'
import Icon from './Icon'

// Bespoke music-library selector for the top bar. Reuses the fork's data layer
// exactly: loads the user's libraries via getOne('user'), stores them through
// the existing setUserLibraries action, and toggles the selection with
// setSelectedLibraries (empty selection means "all accessible"). Renders
// nothing when the user has one library or none, so single-library setups are
// unaffected.
const NdLibrarySelector = () => {
  const dataProvider = useDataProvider()
  const dispatch = useDispatch()
  const refresh = useRefresh()
  const { userLibraries, selectedLibraries } = useSelector((s) => s.library)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const load = useCallback(async () => {
    const userId = localStorage.getItem('userId')
    if (!userId) return
    try {
      const { data } = await dataProvider.getOne('user', { id: userId })
      dispatch(setUserLibraries(data.libraries || []))
    } catch (e) {
      // Non-admin users may not be able to read this; the selector just hides.
    }
  }, [dataProvider, dispatch])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        refresh()
      }
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, refresh])

  if (!userLibraries || userLibraries.length <= 1) return null

  const total = userLibraries.length
  const active =
    selectedLibraries.length === 0 ? total : selectedLibraries.length
  const label =
    active === total ? `Todas (${total})` : `${active} de ${total}`

  const toggle = (id) => {
    // Treat "all selected" as the concrete full list before removing one.
    const base =
      selectedLibraries.length === 0
        ? userLibraries.map((l) => l.id)
        : selectedLibraries
    const next = base.includes(id)
      ? base.filter((x) => x !== id)
      : [...base, id]
    dispatch(setSelectedLibraries(next))
  }

  return (
    <div className="nd-libsel" ref={ref}>
      <button
        className="nd-libsel-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        <Icon name="library" size={18} className="nd-icon" />
        <span className="nd-trunc">{label}</span>
        <Icon name={open ? 'collapse' : 'expandMore'} size={16} className="nd-icon" />
      </button>
      {open ? (
        <div className="nd-libsel-menu" role="menu">
          <div className="nd-libsel-head">Bibliotecas</div>
          {userLibraries.map((lib) => {
            const checked =
              selectedLibraries.length === 0 ||
              selectedLibraries.includes(lib.id)
            return (
              <button
                key={lib.id}
                className={`nd-libsel-item${checked ? ' on' : ''}`}
                role="menuitemcheckbox"
                aria-checked={checked}
                onClick={() => toggle(lib.id)}
                type="button"
              >
                <span className="nd-libsel-check">
                  {checked ? <Icon name="check" size={16} /> : null}
                </span>
                <span className="nd-trunc">{lib.name}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default NdLibrarySelector
