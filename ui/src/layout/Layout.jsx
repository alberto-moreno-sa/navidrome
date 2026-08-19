import React, { useState } from 'react'
import Notification from './Notification'
import { Dialogs } from '../dialogs/Dialogs'
import TopBar from './TopBar'
import QueueDrawer from './QueueDrawer'
import '../themes/redesign.css'

// App shell: three grid rows (top bar, scroll region, player) with the queue
// drawer docked right. react-admin's route content arrives as `children` and
// renders in the scroll region. The music player still mounts globally from
// App.jsx (fixed, bottom) until the bespoke player replaces it.
const Layout = ({ children }) => {
  const [queueOpen, setQueueOpen] = useState(false)
  const [search, setSearch] = useState('')

  return (
    <div className="nd-app">
      <TopBar
        search={search}
        onSearch={setSearch}
        queueOpen={queueOpen}
        onToggleQueue={() => setQueueOpen((o) => !o)}
      />
      <div className="nd-mid">
        <main className="nd-scroll" aria-label="Contenido principal">
          {children}
        </main>
        <QueueDrawer open={queueOpen} />
      </div>
      <div className="nd-player" aria-hidden="true" />
      <Notification />
      <Dialogs />
    </div>
  )
}

export default Layout
