import React, { useState } from 'react'
import { useGetList } from 'react-admin'
import { useCount } from '../common/useCount'

const TABS = ['Actividad', 'Bibliotecas', 'Usuarios', 'Reproductores', 'Faltantes', 'Plugins', 'API']


const Table = ({ resource, sort, columns }) => {
  const { data, ids, loading } = useGetList(resource, { page: 1, perPage: 100 }, sort, {})
  const rows = (ids || []).map((id) => data[id]).filter(Boolean)
  if (!loading && rows.length === 0) return <div className="nd-empty">Sin registros.</div>
  return (
    <div className="nd-table">
      <div className="nd-tablehead">
        {columns.map((c) => (
          <div key={c.key} style={{ flex: c.flex || 1, minWidth: 0 }}>{c.label}</div>
        ))}
      </div>
      {rows.map((r) => (
        <div className="nd-tablerow" key={r.id}>
          {columns.map((c, i) => (
            <div
              key={c.key}
              className={i === 0 ? 'c0' : 'cd'}
              style={{ flex: c.flex || 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {c.render ? c.render(r) : r[c.key] ?? '—'}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

const Activity = () => {
  const albums = useCount('album')
  const artists = useCount('artist')
  const songs = useCount('song')
  const playlists = useCount('playlist')
  const fmt = (n) => (n > 999 ? n.toLocaleString('es') : n)
  const metrics = [
    ['Álbumes', albums], ['Artistas', artists], ['Canciones', songs], ['Listas', playlists],
  ]
  return (
    <>
      <div className="nd-metric-row">
        {metrics.map(([k, v]) => (
          <div className="nd-metric" key={k}>
            <div className="v">{fmt(v)}</div>
            <div className="k">{k}</div>
          </div>
        ))}
      </div>
      <div className="nd-band">Biblioteca vigilada en tiempo real. El escaneo completo corre cada día a las 4:00.</div>
    </>
  )
}

const Admin = () => {
  const [tab, setTab] = useState('Actividad')
  return (
    <div className="nd-settings">
      <div className="nd-page-head"><h1>Administración</h1></div>
      <div className="nd-tabs">
        {TABS.map((t) => (
          <button key={t} className={`nd-chip${tab === t ? ' on' : ''}`} onClick={() => setTab(t)} type="button">{t}</button>
        ))}
      </div>

      {tab === 'Actividad' && <Activity />}
      {tab === 'Bibliotecas' && (
        <Table resource="library" sort={{ field: 'name', order: 'ASC' }} columns={[
          { key: 'name', label: 'Nombre', flex: 2 },
          { key: 'path', label: 'Ruta', flex: 3 },
        ]} />
      )}
      {tab === 'Usuarios' && (
        <Table resource="user" sort={{ field: 'userName', order: 'ASC' }} columns={[
          { key: 'userName', label: 'Usuario', flex: 2 },
          { key: 'name', label: 'Nombre', flex: 2 },
          { key: 'isAdmin', label: 'Rol', flex: 1, render: (r) => (r.isAdmin ? 'Administrador' : 'Normal') },
          { key: 'lastLoginAt', label: 'Último acceso', flex: 2, render: (r) => (r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleDateString('es') : '—') },
        ]} />
      )}
      {tab === 'Reproductores' && (
        <Table resource="player" sort={{ field: 'name', order: 'ASC' }} columns={[
          { key: 'name', label: 'Reproductor', flex: 2 },
          { key: 'client', label: 'Cliente', flex: 2 },
          { key: 'userName', label: 'Usuario', flex: 1 },
          { key: 'transcodingId', label: 'Transcodificación', flex: 2, render: (r) => r.transcodingId || 'Sin transcodificar' },
        ]} />
      )}
      {tab === 'Faltantes' && (
        <Table resource="missing" sort={{ field: 'path', order: 'ASC' }} columns={[
          { key: 'title', label: 'Pista', flex: 2, render: (r) => r.title || r.path?.split('/').pop() || '—' },
          { key: 'path', label: 'Ruta esperada', flex: 4 },
        ]} />
      )}
      {tab === 'Plugins' && (
        <Table resource="plugin" sort={{ field: 'name', order: 'ASC' }} columns={[
          { key: 'name', label: 'Plugin', flex: 2 },
          { key: 'version', label: 'Versión', flex: 1 },
          { key: 'enabled', label: 'Estado', flex: 1, render: (r) => (r.enabled ? 'Activo' : 'Inactivo') },
        ]} />
      )}
      {tab === 'API' && (
        <div className="nd-table">
          <div className="nd-tablehead"><div style={{ flex: 2 }}>Endpoint</div><div style={{ flex: 2 }}>Uso</div><div style={{ flex: 2 }}>Clientes</div></div>
          {[
            ['GET /rest/ping.view', 'Compatibilidad', 'Todos'],
            ['GET /rest/getAlbumList2', 'Listados y vistas', 'Amperfy, DSub'],
            ['GET /rest/stream', 'Stream con transcodificación', 'substreamer, play:Sub'],
            ['GET /api/*', 'API nativa de la UI', 'Web'],
          ].map(([e, u, c]) => (
            <div className="nd-tablerow" key={e}>
              <div className="c0" style={{ flex: 2, fontFamily: 'monospace', fontSize: 13 }}>{e}</div>
              <div className="cd" style={{ flex: 2 }}>{u}</div>
              <div className="cd" style={{ flex: 2 }}>{c}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Admin
