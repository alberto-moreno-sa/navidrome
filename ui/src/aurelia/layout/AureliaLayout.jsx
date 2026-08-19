import React, { useState } from 'react'
import Notification from '../../layout/Notification'
import { Dialogs } from '../../dialogs/Dialogs'
import TopBar from './TopBar'
import QueueDrawer from './QueueDrawer'
import '../aurelia.css'

// Aurelia app shell. Replaces react-admin's Layout: three grid rows (top bar,
// scroll region, player) with the queue drawer docked right. react-admin's
// route content arrives as `children` and renders inside the scroll region.
// The existing music player still mounts globally from App.jsx (fixed, bottom)
// until phase 4 swaps in the bespoke player.
const AureliaLayout = ({ children }) => {
  const [queueOpen, setQueueOpen] = useState(false)
  const [search, setSearch] = useState('')

  return (
    <div className="av-app">
      <TopBar
        search={search}
        onSearch={setSearch}
        queueOpen={queueOpen}
        onToggleQueue={() => setQueueOpen((o) => !o)}
      />
      <div className="av-mid">
        <main className="av-scroll" aria-label="Contenido principal">
          {children}
        </main>
        <QueueDrawer open={queueOpen} />
      </div>
      {/* Player slot (phase 4). For now the react-jinke player floats here. */}
      <div className="av-player" aria-hidden="true" />
      <Notification />
      <Dialogs />
    </div>
  )
}

export default AureliaLayout
