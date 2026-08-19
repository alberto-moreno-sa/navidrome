import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocale, useSetLocale } from 'react-admin'
import { changeTheme } from '../actions'
import { AUTO_THEME_ID } from '../consts'
import Icon from '../common/Icon'

const TABS = ['Appearance', 'Playback', 'Lyrics', 'Metadata', 'Services', 'Shortcuts']
const THEME_BY_LABEL = { Light: 'LightTheme', Dark: 'DarkTheme', System: AUTO_THEME_ID }
const LABEL_BY_THEME = { LightTheme: 'Light', DarkTheme: 'Dark', [AUTO_THEME_ID]: 'System' }
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
  const [tab, setTab] = useState('Appearance')
  const dispatch = useDispatch()
  const themeState = useSelector((s) => s.theme)
  const locale = useLocale()
  const setLocale = useSetLocale()

  // Local-only prefs that mirror the prototype (real wiring lands per-feature).
  const [local, setLocal] = useState({
    defaultView: 'Grid', notifications: true, pwa: true,
    transcode: false, replayGain: 'Album', jukebox: false, resume: true,
    lastfm: true, listenbrainz: true, nowPlaying: true,
  })
  const set = (k, v) => setLocal((p) => ({ ...p, [k]: v }))

  const appearance = LABEL_BY_THEME[themeState] || 'System'

  return (
    <div className="nd-settings">
      <div className="nd-page-head"><h1>Settings</h1></div>
      <div className="nd-tabs">
        {TABS.map((t) => (
          <button key={t} className={`nd-chip${tab === t ? ' on' : ''}`} onClick={() => setTab(t)} type="button">
            {t}
          </button>
        ))}
      </div>

      {tab === 'Appearance' && (
        <>
          <Row label="Appearance" desc="Light, dark, or match the system.">
            <Options value={appearance} options={['Light', 'Dark', 'System']} onPick={(o) => dispatch(changeTheme(THEME_BY_LABEL[o]))} />
          </Row>
          <Row label="Default view" desc="Used when opening the library.">
            <Options value={local.defaultView} options={['Grid', 'List']} onPick={(o) => set('defaultView', o)} />
          </Row>
          <Row label="Language" desc="Community translations.">
            <Options
              value={CODE_LANG[locale] || 'English'}
              options={['Español', 'English', 'Français']}
              onPick={(o) => setLocale(LANG_CODE[o])}
            />
          </Row>
          <Row label="Desktop notifications" desc="Alerts when the track changes.">
            <Toggle on={local.notifications} onClick={() => set('notifications', !local.notifications)} label="Notifications" />
          </Row>
          <Row label="Install as PWA" desc="Service worker active for offline use.">
            <Toggle on={local.pwa} onClick={() => set('pwa', !local.pwa)} label="PWA" />
          </Row>
        </>
      )}

      {tab === 'Playback' && (
        <>
          <Row label="On-the-fly transcoding" desc="Disabled to keep FLAC bit-perfect.">
            <Toggle on={local.transcode} onClick={() => set('transcode', !local.transcode)} label="Transcoding" />
          </Row>
          <Row label="ReplayGain" desc="Normalization from gain tags.">
            <Options value={local.replayGain} options={['Album', 'Track', 'Off']} onPick={(o) => set('replayGain', o)} />
          </Row>
          <Row label="Jukebox mode" desc="Plays through the server's audio output.">
            <Toggle on={local.jukebox} onClick={() => set('jukebox', !local.jukebox)} label="Jukebox" />
          </Row>
          <Row label="Remember position" desc="Bookmarks and resume on long tracks.">
            <Toggle on={local.resume} onClick={() => set('resume', !local.resume)} label="Remember position" />
          </Row>
        </>
      )}

      {tab === 'Lyrics' && (
        <>
          <Row label="Source priority" desc="Lyrics lookup order."><span className="val">.lrc → .elrc → .ttml → embedded</span></Row>
          <Row label="Sidecar extensions" desc="Files next to the audio."><span className="val">.lrc · .elrc · .ttml · .srt · .txt · .yaml</span></Row>
          <Row label="Synchronization" desc="Timestamped formats."><span className="val">LRC · Enhanced LRC · TTML</span></Row>
        </>
      )}

      {tab === 'Metadata' && (
        <>
          <Row label="Curated tags" desc="Read exactly as they are in your files."><span className="val">albumartist · compilation · discsubtitle · mood</span></Row>
          <Row label="External agents" desc="Bios, images and similar artists."><span className="val">Last.fm · Spotify · Deezer</span></Row>
          <Row label="Cover art" desc="Manual upload and cover animation."><span className="val">JPEG · PNG · APNG</span></Row>
        </>
      )}

      {tab === 'Services' && (
        <>
          <Row label="Scrobbling to Last.fm" desc="Authorized account.">
            <Toggle on={local.lastfm} onClick={() => set('lastfm', !local.lastfm)} label="Last.fm" />
          </Row>
          <Row label="Scrobbling to ListenBrainz" desc="Verified token.">
            <Toggle on={local.listenbrainz} onClick={() => set('listenbrainz', !local.listenbrainz)} label="ListenBrainz" />
          </Row>
          <Row label="Now Playing" desc="Publishes the current track in real time.">
            <Toggle on={local.nowPlaying} onClick={() => set('nowPlaying', !local.nowPlaying)} label="Now Playing" />
          </Row>
        </>
      )}

      {tab === 'Shortcuts' && (
        <>
          <Row label="Play or pause" desc="Global."><span className="val">Space</span></Row>
          <Row label="Next or previous track" desc="Global."><span className="val">N · P</span></Row>
          <Row label="Search" desc="Focuses the global search."><span className="val">Ctrl + K</span></Row>
          <Row label="Close menus" desc="Global."><span className="val">Escape</span></Row>
        </>
      )}
    </div>
  )
}

export default Settings
