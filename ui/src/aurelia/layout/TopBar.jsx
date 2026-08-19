import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useLogout, useTranslate } from 'react-admin'
import { changeTheme } from '../../actions'
import { AUTO_THEME_ID } from '../../consts'
import Icon from '../components/Icon'

// Top bar: wordmark, history nav, primary nav (Discover/Library), global search,
// and the account menu. Data actions (theme, logout, navigation) reuse the
// fork's existing redux actions and react-admin hooks — no data layer is touched.
const TopBar = ({ search, onSearch, queueOpen, onToggleQueue }) => {
  const history = useHistory()
  const dispatch = useDispatch()
  const logout = useLogout()
  const translate = useTranslate()
  const theme = useSelector((s) => s.theme)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const username =
    localStorage.getItem('username') || localStorage.getItem('userId') || 'User'
  const initial = username.charAt(0).toUpperCase()
  const isAdmin = localStorage.getItem('role') === 'admin'

  useEffect(() => {
    if (!menuOpen) return undefined
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const themeBtn = (label, icon, value) => (
    <button
      className={theme === value ? 'on' : ''}
      onClick={() => dispatch(changeTheme(value))}
      type="button"
    >
      <Icon name={icon} className="av-icon" />
      {label}
    </button>
  )

  const go = (path) => {
    setMenuOpen(false)
    history.push(path)
  }

  return (
    <header className="av-topbar">
      <div className="av-tb-left">
        <div className="av-logo">
          navidrom<span>e</span>
        </div>
        <div className="av-histnav">
          <button
            className="av-circ"
            aria-label={translate('ra.action.back', { _: 'Atrás' })}
            onClick={() => history.goBack()}
            type="button"
          >
            <Icon name="back" className="av-icon" />
          </button>
          <button
            className="av-circ"
            aria-label="Adelante"
            onClick={() => history.goForward()}
            type="button"
          >
            <Icon name="forward" className="av-icon" />
          </button>
        </div>
        <nav className="av-nav" aria-label="Primary">
          <NavLink to="/" exact activeClassName="on">
            <Icon name="discover" className="av-icon" />
            Descubrir
          </NavLink>
          <NavLink to="/album" activeClassName="on">
            <Icon name="library" className="av-icon" />
            Biblioteca
          </NavLink>
        </nav>
      </div>

      <div className="av-tb-right">
        <div className="av-search">
          <Icon name="search" className="av-icon" />
          <input
            placeholder={translate('ra.action.search', { _: 'Búsqueda' })}
            aria-label="Búsqueda"
            value={search || ''}
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>

        <button
          className="av-circ"
          aria-label="Cola de reproducción"
          aria-pressed={!!queueOpen}
          onClick={() => onToggleQueue && onToggleQueue()}
          type="button"
        >
          <Icon name="queue" className="av-icon" />
        </button>

        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            className="av-avatar"
            aria-label="Cuenta"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            type="button"
          >
            {initial}
          </button>

          {menuOpen && (
            <div className="av-menu" role="menu">
              <div className="av-menu-id">
                <b>{username}</b>
                <i>{isAdmin ? 'Admin' : 'Studio'}</i>
              </div>
              <div className="av-menu-sec">
                <h5>
                  <Icon name="sparkle" className="av-icon" />
                  Aspecto
                </h5>
                <div className="av-seg">
                  {themeBtn('Claro', 'sun', 'LightTheme')}
                  {themeBtn('Oscuro', 'moon', 'DarkTheme')}
                  {themeBtn('Sistema', 'system', AUTO_THEME_ID)}
                </div>
              </div>
              <div className="av-menu-list">
                <button type="button" onClick={() => go('/personal')}>
                  <Icon name="account" className="av-icon" />
                  Cuenta
                </button>
                <button type="button" onClick={() => go('/personal')}>
                  <Icon name="settings" className="av-icon" />
                  Ajustes
                </button>
                <button type="button" className="sep" onClick={() => logout()}>
                  <Icon name="logout" className="av-icon" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopBar
