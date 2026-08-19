import React from 'react'

// Material Symbols Rounded (variable, ligatures). Components keep their friendly
// names; this maps each to the canonical ligature from the element inventory
// (03-inventario-de-elementos.md). Loaded via @fontsource-variable in index.jsx.
const LIGATURE = {
  play: 'play_arrow', pause: 'pause', prev: 'skip_previous', next: 'skip_next',
  shuffle: 'shuffle', repeat: 'repeat', repeatOne: 'repeat_one',
  heart: 'favorite', heartFilled: 'favorite',
  star: 'star', starOutline: 'star',
  search: 'search', back: 'chevron_left', forward: 'chevron_right', chevron: 'chevron_right',
  expandMore: 'expand_more',
  discover: 'explore', magazine: 'menu_book', library: 'library_music',
  all: 'apps', album: 'album', artist: 'artist', song: 'music_note',
  playlist: 'queue_music', genre: 'label', radio: 'radio', share: 'share',
  account: 'person', settings: 'settings', logout: 'logout', admin: 'admin_panel_settings',
  sun: 'light_mode', moon: 'dark_mode', system: 'contrast', sparkle: 'palette',
  keyboard: 'keyboard', support: 'help', filter: 'tune', sliders: 'tune',
  sort: 'arrow_downward', swap: 'swap_vert',
  download: 'download', follow: 'how_to_reg',
  radioUnchecked: 'radio_button_unchecked', radioChecked: 'radio_button_checked',
  award: 'workspace_premium', kebab: 'more_vert', info: 'info',
  volume: 'volume_up', volumeOff: 'volume_off',
  output: 'speaker', queue: 'queue_music', history: 'history', lyrics: 'lyrics', lyricsOff: 'lyrics_off',
  expand: 'open_in_full', collapse: 'close_fullscreen', add: 'add', close: 'close',
  external: 'open_in_new', inspect: 'data_object', playlistAdd: 'playlist_add', zip: 'folder_zip',
  cast: 'cast', check: 'check', edit: 'edit', delete: 'delete', refresh: 'refresh',
  upload: 'upload', uploadFile: 'upload_file', autoAwesome: 'auto_awesome',
  addLink: 'add_link', copy: 'content_copy', update: 'update', linkOff: 'link_off',
  graphicEq: 'graphic_eq', personAdd: 'person_add', checkCircle: 'check_circle', error: 'error',
  warning: 'warning', searchOff: 'search_off', libraryAdd: 'library_add', cloudOff: 'cloud_off',
  wifiOff: 'wifi_off', radar: 'radar', monitoring: 'monitoring', libraryMusic: 'library_music',
  group: 'group', devices: 'devices', folderOff: 'folder_off', extension: 'extension', api: 'api',
  dragIndicator: 'drag_indicator', dataObject: 'data_object',
}

// Icons that render filled by default (transport + filled states).
const DEFAULT_FILLED = new Set(['play', 'pause', 'prev', 'next', 'heartFilled', 'radioChecked'])

export const Icon = ({ name, size = 18, fill, className = '', title, ...rest }) => {
  const lig = LIGATURE[name] || name
  const isFilled = fill != null ? fill : DEFAULT_FILLED.has(name)
  return (
    <span
      className={`nd-msym${isFilled ? ' fill' : ''}${className ? ` ${className}` : ''}`}
      style={{ fontSize: size, width: size, height: size }}
      aria-hidden={title ? undefined : 'true'}
      title={title}
      {...rest}
    >
      {lig}
    </span>
  )
}

export default Icon
