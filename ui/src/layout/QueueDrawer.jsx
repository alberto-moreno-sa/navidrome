import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import Icon from '../common/Icon'

// Right-docked queue drawer. Reads the real player queue from redux
// (state.player). Three visual zones: played (dimmed), current
// (--surface-accent + amber title), upcoming (full contrast).
const QueueDrawer = ({ open }) => {
  const [tab, setTab] = useState('queue')
  const [autoplay, setAutoplay] = useState(true)
  const queue = useSelector((s) => s.player?.queue || [])
  const current = useSelector((s) => s.player?.current || {})
  const currentUuid = current.uuid

  const currentIndex = queue.findIndex((t) => t.uuid === currentUuid)

  const zoneOf = (i) => {
    if (currentIndex < 0) return ''
    if (i < currentIndex) return ' done'
    if (i === currentIndex) return ' on'
    return ''
  }

  const rows = tab === 'queue' ? queue : []

  return (
    <aside
      className={`nd-queue${open ? ' open' : ''}`}
      aria-label="Cola de reproducción"
      aria-hidden={!open}
    >
      <div className="nd-qhead">
        <button
          className={`nd-qtab${tab === 'queue' ? ' on' : ''}`}
          onClick={() => setTab('queue')}
          type="button"
        >
          <Icon name="queue" className="nd-icon" />
          Cola
        </button>
        <button
          className={`nd-qtab${tab === 'history' ? ' on' : ''}`}
          onClick={() => setTab('history')}
          type="button"
        >
          <Icon name="history" className="nd-icon" />
          Historial
        </button>
        <button
          className={`nd-qtab${tab === 'lyrics' ? ' on' : ''}`}
          onClick={() => setTab('lyrics')}
          type="button"
        >
          <Icon name="info" className="nd-icon" />
          Letra
        </button>
      </div>

      <div className="nd-qlist">
        {tab === 'lyrics' ? (
          <div
            style={{ whiteSpace: 'pre-wrap', padding: 8, fontSize: 14, lineHeight: '22px', color: 'var(--text-secondary)' }}
          >
            {current.song?.lyrics || current.lyric || 'Sin letra para esta pista.'}
          </div>
        ) : rows.length === 0 ? (
          <div className="nd-empty">
            {tab === 'queue'
              ? 'La cola está vacía. Elige algo para reproducir.'
              : 'Aún no hay historial.'}
          </div>
        ) : (
          rows.map((t, i) => (
            <button className={`nd-qrow${zoneOf(i)}`} key={t.uuid || i} type="button">
              <span className="th">
                {t.cover ? <img src={t.cover} alt="" /> : null}
              </span>
              <div className="lines">
                <div className="t nd-trunc">{t.name || t.title || '—'}</div>
                <div className="s nd-trunc">{t.singer || t.artist || ''}</div>
              </div>
              <span className="nd-kebab" style={{ opacity: 1 }}>
                <Icon name="kebab" className="nd-icon" />
              </span>
            </button>
          ))
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
