import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Icon from '../common/Icon'
import NdLove from '../common/NdLove'
import PlayerExpanded from './PlayerExpanded'
import { setPlayMode } from '../actions'

const fmt = (s) => {
  if (!s || Number.isNaN(s)) return '00:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// The react-jinke engine renders a single <audio> element (hidden) and adds
// togglePlay/playNext/playPrev to it. The bar reads and drives that element
// directly, so it never depends on mount order. The engine keeps owning audio,
// queue, gapless, media session, scrobble, keepalive and transcoding. Shuffle
// and repeat are driven through the engine's playMode (redux player.mode).
const audioEl = () => (typeof document !== 'undefined' ? document.querySelector('audio') : null)

// Repeat cycles order → repeat-all → repeat-one; shuffle toggles the shuffle
// mode. Both map onto the single engine playMode.
const REPEAT_NEXT = { order: 'orderLoop', orderLoop: 'singleLoop', singleLoop: 'order', shufflePlay: 'orderLoop' }

const PlayerBar = ({ onToggleQueue }) => {
  const playerState = useSelector((s) => s.player)
  const dispatch = useDispatch()
  const history = useHistory()
  const current = playerState?.current || {}
  const queueLen = playerState?.queue?.length || 0
  const mode = playerState?.mode || 'order'
  const [tick, setTick] = useState({ t: 0, d: 0, paused: true, vol: 1, muted: false })
  const [expanded, setExpanded] = useState(false)
  const [menu, setMenu] = useState(null) // 'quality' | 'output' | 'kebab' | null
  const menuRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => {
      const au = audioEl()
      if (au) {
        setTick({
          t: au.currentTime || 0,
          d: au.duration || 0,
          paused: au.paused,
          vol: au.volume,
          muted: au.muted,
        })
      }
    }, 250)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!menu) return undefined
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(null)
    }
    const onKey = (e) => e.key === 'Escape' && setMenu(null)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menu])

  if (queueLen === 0) return <div className="nd-player" aria-hidden="true" />

  const song = current.song || {}
  const title = current.name || song.title || '—'
  const sub = [current.singer || song.artist, song.album].filter(Boolean).join(' — ')
  const pct = tick.d ? (tick.t / tick.d) * 100 : 0
  const volPct = tick.muted ? 0 : Math.round((tick.vol ?? 1) * 100)

  const shuffleOn = mode === 'shufflePlay'
  const repeatState = mode === 'singleLoop' ? 'one' : mode === 'orderLoop' ? 'all' : 'off'

  const seek = (e) => {
    const au = audioEl()
    if (!au || !tick.d) return
    const r = e.currentTarget.getBoundingClientRect()
    au.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * tick.d
  }
  const setVol = (e) => {
    const au = audioEl()
    if (!au) return
    const r = e.currentTarget.getBoundingClientRect()
    au.volume = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
    if (au.muted) au.muted = false
  }
  const call = (fn) => () => {
    const au = audioEl()
    if (au && typeof au[fn] === 'function') au[fn]()
  }
  const toggleMute = () => {
    const au = audioEl()
    if (au) au.muted = !au.muted
  }
  const toggleShuffle = () => dispatch(setPlayMode(shuffleOn ? 'order' : 'shufflePlay'))
  const cycleRepeat = () => dispatch(setPlayMode(REPEAT_NEXT[mode] || 'orderLoop'))
  const goto = (path) => {
    setMenu(null)
    if (path) history.push(path)
  }

  // Transcoding is on when the played suffix differs from the source suffix.
  const codec = (song.suffix || '').toUpperCase()
  const khz = song.sampleRate ? `${Math.round((song.sampleRate / 1000) * 10) / 10} kHz` : null
  const bits = song.bitDepth ? `${song.bitDepth} bit` : null
  const kbps = song.bitRate ? `${song.bitRate} kbps` : null
  const channels = song.channels === 1 ? 'Mono' : song.channels === 2 ? 'Estéreo' : song.channels ? `${song.channels} canales` : null
  const qualityLabel = [bits, khz].filter(Boolean).join(' · ') || codec || null

  return (
    <>
      <footer className="nd-playerbar" ref={menuRef}>
        <div className="nd-pbar" onClick={seek} role="slider" aria-label="Progreso" tabIndex={-1}>
          <div className="nd-pbuf" />
          <div className="nd-pfill" style={{ width: `${pct}%` }} />
        </div>
        <div className="nd-pbody">
          <div className="nd-pnow">
            <button
              className="nd-pcover"
              onClick={() => setExpanded(true)}
              aria-label="Abrir reproductor"
              type="button"
              style={{ padding: 0, cursor: 'pointer', border: 0 }}
            >
              {current.cover ? <img src={current.cover} alt="" /> : null}
            </button>
            <div className="nd-ptxt">
              <div className="t nd-trunc">{title}</div>
              <div className="s nd-trunc">{sub}</div>
            </div>
            {song.id && !current.isRadio ? (
              <NdLove resource="song" record={song} size={18} />
            ) : null}
            <div className="nd-ptime">
              <span className="a">{fmt(tick.t)}</span>
              <span>—</span>
              <span className="b">{fmt(tick.d)}</span>
            </div>
          </div>

          <div className="nd-ptransport">
            <button
              className={shuffleOn ? 'on' : ''}
              aria-label="Aleatorio"
              aria-pressed={shuffleOn}
              onClick={toggleShuffle}
              type="button"
            >
              <Icon name="shuffle" size={20} />
            </button>
            <button aria-label="Anterior" onClick={call('playPrev')} type="button"><Icon name="prev" size={20} /></button>
            <button className="main" aria-label={tick.paused ? 'Reproducir' : 'Pausar'} onClick={call('togglePlay')} type="button">
              <Icon name={tick.paused ? 'play' : 'pause'} size={26} />
            </button>
            <button aria-label="Siguiente" onClick={call('playNext')} type="button"><Icon name="next" size={20} /></button>
            <button
              className={repeatState !== 'off' ? 'on' : ''}
              aria-label={repeatState === 'one' ? 'Repetir una' : repeatState === 'all' ? 'Repetir todo' : 'Repetir'}
              aria-pressed={repeatState !== 'off'}
              onClick={cycleRepeat}
              type="button"
            >
              <Icon name={repeatState === 'one' ? 'repeatOne' : 'repeat'} size={20} />
            </button>
          </div>

          <div className="nd-pright">
            <div className="nd-pvol">
              <button className="nd-pvolbtn" aria-label={tick.muted ? 'Activar sonido' : 'Silenciar'} aria-pressed={tick.muted} onClick={toggleMute} type="button">
                <Icon name={tick.muted || volPct === 0 ? 'volumeOff' : 'volume'} size={18} />
              </button>
              <div className="nd-voltrack" onClick={setVol} role="slider" aria-label="Volumen" tabIndex={-1}>
                <div className="nd-volfill" style={{ width: `${volPct}%` }} />
              </div>
            </div>

            {qualityLabel ? (
              <div className="nd-pmenu-anchor">
                <button
                  className={`nd-pqual${menu === 'quality' ? ' on' : ''}`}
                  onClick={() => setMenu(menu === 'quality' ? null : 'quality')}
                  aria-haspopup="menu"
                  aria-expanded={menu === 'quality'}
                  aria-label="Calidad de audio"
                  type="button"
                >
                  <span className="nd-res">{qualityLabel}</span>
                </button>
                {menu === 'quality' ? (
                  <div className="nd-ppop" role="menu">
                    <div className="nd-ppop-title">Calidad de audio</div>
                    <dl className="nd-ppop-kv">
                      {codec ? (<><dt>Formato</dt><dd>{codec}</dd></>) : null}
                      {kbps ? (<><dt>Tasa de bits</dt><dd>{kbps}</dd></>) : null}
                      {khz ? (<><dt>Frecuencia</dt><dd>{khz}</dd></>) : null}
                      {bits ? (<><dt>Profundidad</dt><dd>{bits}</dd></>) : null}
                      {channels ? (<><dt>Canales</dt><dd>{channels}</dd></>) : null}
                    </dl>
                    <div className="nd-ppop-note">Reproduciendo desde el origen, sin transcodificar.</div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="nd-pmenu-anchor">
              <button
                className={`nd-pout${menu === 'output' ? ' on' : ''}`}
                onClick={() => setMenu(menu === 'output' ? null : 'output')}
                aria-haspopup="menu"
                aria-expanded={menu === 'output'}
                type="button"
              >
                <Icon name="output" size={18} />
                Salida predeterminada
              </button>
              {menu === 'output' ? (
                <div className="nd-ppop" role="menu">
                  <div className="nd-ppop-title">Salida de audio</div>
                  <button className="nd-ppop-item on" role="menuitemradio" aria-checked="true" type="button">
                    <Icon name="output" size={18} />
                    <span>Salida predeterminada del sistema</span>
                    <Icon name="check" size={16} />
                  </button>
                  <div className="nd-ppop-note">El navegador reproduce en el dispositivo de salida del sistema.</div>
                </div>
              ) : null}
            </div>

            <div className="nd-pmenu-anchor">
              <button
                className={`nd-circ${menu === 'kebab' ? ' on' : ''}`}
                aria-label="Más opciones"
                aria-haspopup="menu"
                aria-expanded={menu === 'kebab'}
                onClick={() => setMenu(menu === 'kebab' ? null : 'kebab')}
                type="button"
              >
                <Icon name="kebab" size={18} />
              </button>
              {menu === 'kebab' ? (
                <div className="nd-ppop" role="menu">
                  <button className="nd-ppop-item" role="menuitem" type="button" onClick={() => goto(song.albumId ? `/album/${song.albumId}/show` : null)} disabled={!song.albumId}>
                    <Icon name="album" size={18} />
                    <span>Ir al álbum</span>
                  </button>
                  <button className="nd-ppop-item" role="menuitem" type="button" onClick={() => goto(song.artistId ? `/artist/${song.artistId}/show` : null)} disabled={!song.artistId}>
                    <Icon name="artist" size={18} />
                    <span>Ir al artista</span>
                  </button>
                  <button className="nd-ppop-item" role="menuitem" type="button" onClick={() => { setMenu(null); setExpanded(true) }}>
                    <Icon name="info" size={18} />
                    <span>Información</span>
                  </button>
                </div>
              ) : null}
            </div>

            <button className="nd-pqueue" aria-label="Cola de reproducción" onClick={onToggleQueue} type="button">
              <Icon name="queue" size={18} />
              {queueLen > 0 ? <span className="nd-pcount">{queueLen}</span> : null}
            </button>
          </div>
        </div>
      </footer>
      {expanded ? <PlayerExpanded onClose={() => setExpanded(false)} /> : null}
    </>
  )
}

export default PlayerBar
