import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocale, useSetLocale } from 'react-admin'
import { changeTheme } from '../actions'
import { AUTO_THEME_ID } from '../consts'
import Icon from '../common/Icon'

const TABS = ['Apariencia', 'Reproducción', 'Letras', 'Metadata', 'Servicios', 'Atajos']
const THEME_BY_LABEL = { Claro: 'LightTheme', Oscuro: 'DarkTheme', Sistema: AUTO_THEME_ID }
const LABEL_BY_THEME = { LightTheme: 'Claro', DarkTheme: 'Oscuro', [AUTO_THEME_ID]: 'Sistema' }
const LANG_CODE = { Español: 'es', English: 'en', Français: 'fr' }
const CODE_LANG = { es: 'Español', en: 'English', fr: 'Français' }

const Toggle = ({ on, onClick, label }) => (
  <button
    className={`nd-toggle${on ? ' on' : ''}`}
    role="switch"
    aria-checked={on}
    aria-label={label}
    onClick={onClick}
    type="button"
  >
    <span className="knob" />
  </button>
)

const Options = ({ value, options, onPick }) => (
  <div className="nd-optrow">
    {options.map((o) => (
      <button
        key={o}
        className={`nd-chip${value === o ? ' on' : ''}`}
        onClick={() => onPick(o)}
        type="button"
      >
        {o}
      </button>
    ))}
  </div>
)

const Row = ({ label, desc, children }) => (
  <div className="nd-setrow">
    <div className="lbl">
      <b>{label}</b>
      <span>{desc}</span>
    </div>
    <div className="ctl">{children}</div>
  </div>
)

const Settings = () => {
  const [tab, setTab] = useState('Apariencia')
  const dispatch = useDispatch()
  const themeState = useSelector((s) => s.theme)
  const locale = useLocale()
  const setLocale = useSetLocale()

  // Local-only prefs that mirror the prototype (real wiring lands per-feature).
  const [local, setLocal] = useState({
    defaultView: 'Cuadrícula', notifications: true, pwa: true,
    transcode: false, replayGain: 'Álbum', jukebox: false, resume: true,
    lastfm: true, listenbrainz: true, nowPlaying: true,
  })
  const set = (k, v) => setLocal((p) => ({ ...p, [k]: v }))

  const appearance = LABEL_BY_THEME[themeState] || 'Sistema'

  return (
    <div className="nd-settings">
      <div className="nd-page-head"><h1>Ajustes</h1></div>
      <div className="nd-tabs">
        {TABS.map((t) => (
          <button key={t} className={`nd-chip${tab === t ? ' on' : ''}`} onClick={() => setTab(t)} type="button">
            {t}
          </button>
        ))}
      </div>

      {tab === 'Apariencia' && (
        <>
          <Row label="Aspecto" desc="Claro, oscuro o según el sistema.">
            <Options value={appearance} options={['Claro', 'Oscuro', 'Sistema']} onPick={(o) => dispatch(changeTheme(THEME_BY_LABEL[o]))} />
          </Row>
          <Row label="Vista por defecto" desc="Se usa al abrir la biblioteca.">
            <Options value={local.defaultView} options={['Cuadrícula', 'Lista']} onPick={(o) => set('defaultView', o)} />
          </Row>
          <Row label="Idioma" desc="Traducciones de la comunidad.">
            <Options
              value={CODE_LANG[locale] || 'Español'}
              options={['Español', 'English', 'Français']}
              onPick={(o) => setLocale(LANG_CODE[o])}
            />
          </Row>
          <Row label="Notificaciones de escritorio" desc="Avisa al cambiar de pista.">
            <Toggle on={local.notifications} onClick={() => set('notifications', !local.notifications)} label="Notificaciones" />
          </Row>
          <Row label="Instalar como PWA" desc="Service worker activo para uso sin conexión.">
            <Toggle on={local.pwa} onClick={() => set('pwa', !local.pwa)} label="PWA" />
          </Row>
        </>
      )}

      {tab === 'Reproducción' && (
        <>
          <Row label="Transcodificación al vuelo" desc="Desactivada para conservar FLAC bit-perfect.">
            <Toggle on={local.transcode} onClick={() => set('transcode', !local.transcode)} label="Transcodificación" />
          </Row>
          <Row label="ReplayGain" desc="Normalización según las etiquetas de ganancia.">
            <Options value={local.replayGain} options={['Álbum', 'Pista', 'Desactivado']} onPick={(o) => set('replayGain', o)} />
          </Row>
          <Row label="Modo jukebox" desc="Reproduce en la salida de audio del servidor.">
            <Toggle on={local.jukebox} onClick={() => set('jukebox', !local.jukebox)} label="Jukebox" />
          </Row>
          <Row label="Recordar posición" desc="Marcadores y reanudación en pistas largas.">
            <Toggle on={local.resume} onClick={() => set('resume', !local.resume)} label="Recordar posición" />
          </Row>
        </>
      )}

      {tab === 'Letras' && (
        <>
          <Row label="Prioridad de fuentes" desc="Orden de búsqueda de la letra."><span className="val">.lrc → .elrc → .ttml → embebidas</span></Row>
          <Row label="Extensiones sidecar" desc="Archivos junto al audio."><span className="val">.lrc · .elrc · .ttml · .srt · .txt · .yaml</span></Row>
          <Row label="Sincronización" desc="Formatos con marcas de tiempo."><span className="val">LRC · Enhanced LRC · TTML</span></Row>
        </>
      )}

      {tab === 'Metadata' && (
        <>
          <Row label="Etiquetas curadas" desc="Se leen tal como están en tus archivos."><span className="val">albumartist · compilation · discsubtitle · mood</span></Row>
          <Row label="Agentes externos" desc="Biografías, imágenes y similares."><span className="val">Last.fm · Spotify · Deezer</span></Row>
          <Row label="Carátulas" desc="Subida manual y animación de portada."><span className="val">JPEG · PNG · APNG</span></Row>
        </>
      )}

      {tab === 'Servicios' && (
        <>
          <Row label="Scrobbling a Last.fm" desc="Cuenta autorizada.">
            <Toggle on={local.lastfm} onClick={() => set('lastfm', !local.lastfm)} label="Last.fm" />
          </Row>
          <Row label="Scrobbling a ListenBrainz" desc="Token verificado.">
            <Toggle on={local.listenbrainz} onClick={() => set('listenbrainz', !local.listenbrainz)} label="ListenBrainz" />
          </Row>
          <Row label="Now Playing" desc="Publica la pista en curso en tiempo real.">
            <Toggle on={local.nowPlaying} onClick={() => set('nowPlaying', !local.nowPlaying)} label="Now Playing" />
          </Row>
        </>
      )}

      {tab === 'Atajos' && (
        <>
          <Row label="Reproducir o pausar" desc="Global."><span className="val">Espacio</span></Row>
          <Row label="Pista siguiente o anterior" desc="Global."><span className="val">N · P</span></Row>
          <Row label="Buscar" desc="Enfoca la búsqueda global."><span className="val">Ctrl + K</span></Row>
          <Row label="Cerrar menús" desc="Global."><span className="val">Escape</span></Row>
        </>
      )}
    </div>
  )
}

export default Settings
