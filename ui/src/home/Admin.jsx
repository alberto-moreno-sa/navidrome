import React, { useState } from 'react'
import { useGetList } from 'react-admin'
import { useCount } from '../common/useCount'

const TABS = ['Activity', 'Libraries', 'Users', 'Players', 'Missing', 'Plugins', 'API']


const Table = ({ resource, sort, columns }) => {
  const { data, ids, loading } = useGetList(resource, { page: 1, perPage: 100 }, sort, {})
  const rows = (ids || []).map((id) => data[id]).filter(Boolean)
  if (!loading && rows.length === 0) return <div className="nd-empty">No records.</div>
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
  const fmt = (n) => (n > 999 ? n.toLocaleString('en') : n)
  const metrics = [
    ['Albums', albums], ['Artists', artists], ['Songs', songs], ['Playlists', playlists],
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
      <div className="nd-band">Library monitored in real time. The full scan runs every day at 4:00.</div>
    </>
  )
}

const Admin = () => {
  const [tab, setTab] = useState('Activity')
  return (
    <div className="nd-settings">
      <div className="nd-page-head"><h1>Administration</h1></div>
      <div className="nd-tabs">
        {TABS.map((t) => (
          <button key={t} className={`nd-chip${tab === t ? ' on' : ''}`} onClick={() => setTab(t)} type="button">{t}</button>
        ))}
      </div>

      {tab === 'Activity' && <Activity />}
      {tab === 'Libraries' && (
        <Table resource="library" sort={{ field: 'name', order: 'ASC' }} columns={[
          { key: 'name', label: 'Name', flex: 2 },
          { key: 'path', label: 'Path', flex: 3 },
        ]} />
      )}
      {tab === 'Users' && (
        <Table resource="user" sort={{ field: 'userName', order: 'ASC' }} columns={[
          { key: 'userName', label: 'User', flex: 2 },
          { key: 'name', label: 'Name', flex: 2 },
          { key: 'isAdmin', label: 'Role', flex: 1, render: (r) => (r.isAdmin ? 'Administrator' : 'Standard') },
          { key: 'lastLoginAt', label: 'Last login', flex: 2, render: (r) => (r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleDateString('en') : '—') },
        ]} />
      )}
      {tab === 'Players' && (
        <Table resource="player" sort={{ field: 'name', order: 'ASC' }} columns={[
          { key: 'name', label: 'Player', flex: 2 },
          { key: 'client', label: 'Client', flex: 2 },
          { key: 'userName', label: 'User', flex: 1 },
          { key: 'transcodingId', label: 'Transcoding', flex: 2, render: (r) => r.transcodingId || 'No transcoding' },
        ]} />
      )}
      {tab === 'Missing' && (
        <Table resource="missing" sort={{ field: 'path', order: 'ASC' }} columns={[
          { key: 'title', label: 'Track', flex: 2, render: (r) => r.title || r.path?.split('/').pop() || '—' },
          { key: 'path', label: 'Expected path', flex: 4 },
        ]} />
      )}
      {tab === 'Plugins' && (
        <Table resource="plugin" sort={{ field: 'name', order: 'ASC' }} columns={[
          { key: 'name', label: 'Plugin', flex: 2 },
          { key: 'version', label: 'Version', flex: 1 },
          { key: 'enabled', label: 'Status', flex: 1, render: (r) => (r.enabled ? 'Active' : 'Inactive') },
        ]} />
      )}
      {tab === 'API' && (
        <div className="nd-table">
          <div className="nd-tablehead"><div style={{ flex: 2 }}>Endpoint</div><div style={{ flex: 2 }}>Usage</div><div style={{ flex: 2 }}>Clients</div></div>
          {[
            ['GET /rest/ping.view', 'Compatibility', 'All'],
            ['GET /rest/getAlbumList2', 'Listings and views', 'Amperfy, DSub'],
            ['GET /rest/stream', 'Stream with transcoding', 'substreamer, play:Sub'],
            ['GET /api/*', 'Native UI API', 'Web'],
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
