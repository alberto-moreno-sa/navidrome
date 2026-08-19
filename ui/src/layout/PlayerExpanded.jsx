import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Icon from '../common/Icon'

const fmt = (s) => {
  if (!s || Number.isNaN(s)) return '00:00'
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}
const audioEl = () => (typeof document !== 'undefined' ? document.querySelector('audio') : null)

// Fullscreen "now playing". Reuses the same hidden engine's <audio> element, so
// it never starts or changes playback on its own — it only reflects and drives
// what is already loaded. Queue on the right, transport in the center.
const PlayerExpanded = ({ onClose }) => {
  const playerState = useSelector((s) => s.player)
  const current = playerState?.current || {}
  const queue = playerState?.queue || []
  const currentUuid = current.uuid
  const [tab, setTab] = useState('desc')
  const [tick, setTick] = useState({ t: 0, d: 0, paused: true })

  useEffect(() => {
    const id = setInterval(() => {
      const au = audioEl()
      if (au) setTick({ t: au.currentTime || 0, d: au.duration || 0, paused: au.paused })
    }, 250)
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      clearInterval(id)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const title = current.name || current.song?.title || '—'
  const sub = [current.singer || current.song?.artist, current.song?.album].filter(Boolean).join(' — ')
  const pct = tick.d ? (tick.t / tick.d) * 100 : 0
  const call = (fn) => () => {
    const au = audioEl()
    if (au && typeof au[fn] === 'function') au[fn]()
  }
  const seek = (e) => {
    const au = audioEl()
    if (!au || !tick.d) return
    const r = e.currentTarget.getBoundingClientRect()
    au.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * tick.d
  }
  const currentIndex = queue.findIndex((t) => t.uuid === currentUuid)

  return (
    <div className="nd-fs" role="dialog" aria-label="Reproductor">
      <div className="nd-fs-head">
        <div className="nd-fs-tabs">
          <button className={`nd-fs-tab${tab === 'desc' ? ' on' : ''}`} onClick={() => setTab('desc')} type="button">Descripción</button>
          <button className={`nd-fs-tab${tab === 'cred' ? ' on' : ''}`} onClick={() => setTab('cred')} type="button">Créditos</button>
        </div>
        <button className="nd-circ" aria-label="Contraer" onClick={onClose} type="button"><Icon name="collapse" size={18} /></button>
      </div>
      <div className="nd-fs-main">
        <div className="nd-fs-left">
          <div className="nd-fs-cover">{current.cover ? <img src={current.cover} alt="" /> : null}</div>
          <div className="nd-fs-meta">
            <div className="t nd-trunc">{title}</div>
            <div className="s nd-trunc">{sub}</div>
          </div>
          <div className="nd-fs-prog">
            <div className="nd-fs-bar" onClick={seek} role="slider" aria-label="Progreso" tabIndex={-1}>
              <div className="nd-fs-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="nd-fs-times"><span>{fmt(tick.t)}</span><span>{fmt(tick.d)}</span></div>
          </div>
          <div className="nd-fs-transport">
            <button aria-label="Aleatorio" type="button"><Icon name="shuffle" size={22} /></button>
            <button aria-label="Anterior" onClick={call('playPrev')} type="button"><Icon name="prev" size={22} /></button>
            <button className="main" aria-label={tick.paused ? 'Reproducir' : 'Pausar'} onClick={call('togglePlay')} type="button"><Icon name={tick.paused ? 'play' : 'pause'} size={30} /></button>
            <button aria-label="Siguiente" onClick={call('playNext')} type="button"><Icon name="next" size={22} /></button>
            <button aria-label="Repetir" type="button"><Icon name="repeat" size={22} /></button>
          </div>
        </div>
        <div className="nd-fs-right">
          <div className="nd-fs-qtitle">Cola de reproducción</div>
          <div className="nd-fs-qlist">
            {queue.map((t, i) => {
              const zone = currentIndex < 0 ? '' : i < currentIndex ? ' done' : i === currentIndex ? ' on' : ''
              return (
                <div className={`nd-qrow${zone}`} key={t.uuid || i}>
                  <span className="th">{t.cover ? <img src={t.cover} alt="" /> : null}</span>
                  <div className="lines">
                    <div className="t nd-trunc">{t.name || t.title}</div>
                    <div className="s nd-trunc">{t.singer || t.artist || ''}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayerExpanded
