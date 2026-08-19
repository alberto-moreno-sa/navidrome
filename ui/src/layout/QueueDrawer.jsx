import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useDataProvider, useNotify } from 'react-admin'
import Icon from '../common/Icon'
import { clearQueue, syncQueue } from '../actions'

const audioEl = () => (typeof document !== 'undefined' ? document.querySelector('audio') : null)

// Parse the engine's synced lyric string ("[mm:ss.xx] text") into timed lines.
const parseLyrics = (raw) => {
  if (!raw) return []
  const out = []
  raw.split('\n').forEach((line) => {
    const m = line.match(/^\[(\d+):(\d+)(?:\.(\d+))?\]\s?(.*)$/)
    if (m) {
      const min = parseInt(m[1], 10)
      const sec = parseInt(m[2], 10)
      const cs = m[3] ? parseInt(m[3], 10) : 0
      out.push({ t: min * 60 + sec + cs / 100, text: m[4] })
    } else if (line.trim()) {
      out.push({ t: null, text: line })
    }
  })
  return out
}

// Right-docked queue drawer. Reads the real player queue from redux. Three
// visual zones (played / current / upcoming); upcoming tracks can be dragged to
// reorder (dispatched through the engine's syncQueue). The queue can be saved as
// a playlist or cleared. The lyrics tab highlights the active synced line.
const QueueDrawer = ({ open }) => {
  const [tab, setTab] = useState('queue')
  const [autoplay, setAutoplay] = useState(true)
  const [dragIndex, setDragIndex] = useState(null)
  const [nowT, setNowT] = useState(0)
  const dispatch = useDispatch()
  const dataProvider = useDataProvider()
  const notify = useNotify()
  const queue = useSelector((s) => s.player?.queue || [])
  const current = useSelector((s) => s.player?.current || {})
  const currentUuid = current.uuid
  const lyricRef = useRef(null)

  const currentIndex = queue.findIndex((t) => t.uuid === currentUuid)

  useEffect(() => {
    if (tab !== 'lyrics' && tab !== 'queue') return undefined
    const id = setInterval(() => {
      const au = audioEl()
      if (au) setNowT(au.currentTime || 0)
    }, 300)
    return () => clearInterval(id)
  }, [tab])

  const zoneOf = (i) => {
    if (currentIndex < 0) return ''
    if (i < currentIndex) return ' done'
    if (i === currentIndex) return ' on'
    return ''
  }

  const onDrop = (to) => {
    if (dragIndex == null || dragIndex === to) return
    // Only allow reordering upcoming tracks, so the current/played stay put.
    if (dragIndex <= currentIndex || to <= currentIndex) {
      setDragIndex(null)
      return
    }
    const next = queue.slice()
    const [moved] = next.splice(dragIndex, 1)
    next.splice(to, 0, moved)
    dispatch(syncQueue(current, next))
    setDragIndex(null)
  }

  const saveAsPlaylist = () => {
    const ids = queue.map((t) => t.trackId || t.song?.id).filter(Boolean)
    if (!ids.length) return
    const name = `Cola guardada`
    dataProvider
      .create('playlist', { data: { name } })
      .then((res) =>
        dataProvider.create('playlistTrack', {
          data: { ids },
          filter: { playlist_id: res.data.id },
        }),
      )
      .then(() => notify('Cola guardada como lista', 'info'))
      .catch(() => notify('No se pudo guardar la cola', 'warning'))
  }

  const doClear = () => {
    const au = audioEl()
    if (au) au.pause()
    dispatch(clearQueue())
  }

  const lyrics = tab === 'lyrics' ? parseLyrics(current.lyric) : []
  const activeLyric = (() => {
    let idx = -1
    for (let i = 0; i < lyrics.length; i += 1) {
      if (lyrics[i].t != null && lyrics[i].t <= nowT + 0.25) idx = i
    }
    return idx
  })()

  useEffect(() => {
    if (tab === 'lyrics' && lyricRef.current) {
      const el = lyricRef.current.querySelector('.on')
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [activeLyric, tab])

  const history = currentIndex > 0 ? queue.slice(0, currentIndex).reverse() : []

  return (
    <aside
      className={`nd-queue${open ? ' open' : ''}`}
      aria-label="Cola de reproducción"
      aria-hidden={!open}
    >
      <div className="nd-qhead">
        <button className={`nd-qtab${tab === 'queue' ? ' on' : ''}`} onClick={() => setTab('queue')} type="button">
          <Icon name="queue" className="nd-icon" />
          Cola
        </button>
        <button className={`nd-qtab${tab === 'history' ? ' on' : ''}`} onClick={() => setTab('history')} type="button">
          <Icon name="history" className="nd-icon" />
          Historial
        </button>
        <button className={`nd-qtab${tab === 'lyrics' ? ' on' : ''}`} onClick={() => setTab('lyrics')} type="button">
          <Icon name="lyrics" className="nd-icon" />
          Letra
        </button>
      </div>

      {tab === 'queue' && queue.length ? (
        <div className="nd-qactions">
          <button className="nd-qact" onClick={saveAsPlaylist} type="button">
            <Icon name="playlistAdd" size={16} />
            Guardar
          </button>
          <button className="nd-qact" onClick={doClear} type="button">
            <Icon name="close" size={16} />
            Limpiar
          </button>
        </div>
      ) : null}

      <div className="nd-qlist" ref={lyricRef}>
        {tab === 'lyrics' ? (
          lyrics.length ? (
            <div className="nd-lyrics">
              {lyrics.map((l, i) => (
                <div key={i} className={`nd-lyric${i === activeLyric ? ' on' : ''}`}>
                  {l.text || '♪'}
                </div>
              ))}
            </div>
          ) : (
            <div className="nd-empty">Sin letra para esta pista.</div>
          )
        ) : tab === 'history' ? (
          history.length === 0 ? (
            <div className="nd-empty">Aún no has reproducido nada en esta sesión.</div>
          ) : (
            history.map((t, i) => (
              <div className="nd-qrow done" key={t.uuid || i}>
                <span className="th">{t.cover ? <img src={t.cover} alt="" /> : null}</span>
                <div className="lines">
                  <div className="t nd-trunc">{t.name || t.title || '—'}</div>
                  <div className="s nd-trunc">{t.singer || t.artist || ''}</div>
                </div>
              </div>
            ))
          )
        ) : queue.length === 0 ? (
          <div className="nd-empty">La cola está vacía. Elige algo para reproducir.</div>
        ) : (
          queue.map((t, i) => {
            const upcoming = currentIndex >= 0 && i > currentIndex
            return (
              <div
                className={`nd-qrow${zoneOf(i)}${dragIndex === i ? ' dragging' : ''}`}
                key={t.uuid || i}
                draggable={upcoming}
                onDragStart={() => upcoming && setDragIndex(i)}
                onDragOver={(e) => upcoming && e.preventDefault()}
                onDrop={() => onDrop(i)}
                onDragEnd={() => setDragIndex(null)}
              >
                {upcoming ? (
                  <span className="nd-qdrag" aria-hidden="true">
                    <Icon name="dragIndicator" size={16} />
                  </span>
                ) : null}
                <span className="th">{t.cover ? <img src={t.cover} alt="" /> : null}</span>
                <div className="lines">
                  <div className="t nd-trunc">{t.name || t.title || '—'}</div>
                  <div className="s nd-trunc">{t.singer || t.artist || ''}</div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="nd-qfoot">
        <button
          className={`nd-sw${autoplay ? ' on' : ''}`}
          role="switch"
          aria-checked={autoplay}
          aria-label="Lectura automática"
          onClick={() => setAutoplay((a) => !a)}
          type="button"
        />
        <div>
          <b>Lectura automática</b>
          <span>Se reproducirán pistas similares cuando termine la cola.</span>
        </div>
      </div>
    </aside>
  )
}

export default QueueDrawer
