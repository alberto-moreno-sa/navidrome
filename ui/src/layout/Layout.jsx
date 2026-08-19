import React, { useState, useMemo } from 'react'
import { ThemeProvider, createTheme } from '@material-ui/core/styles'
import Notification from './Notification'
import { Dialogs } from '../dialogs/Dialogs'
import useCurrentTheme from '../themes/useCurrentTheme'
import TopBar from './TopBar'
import QueueDrawer from './QueueDrawer'
import PlayerBar from './PlayerBar'
import OfflineBanner from './OfflineBanner'
import { useKeyboardShortcuts } from '../common/useKeyboardShortcuts'
import '../themes/redesign.css'

// App shell: three grid rows (top bar, scroll region, player) with the queue
// drawer docked right. react-admin's route content arrives as `children` and
// renders in the scroll region.
//
// Crucially this replaces react-admin's Layout, which used to supply the MUI
// ThemeProvider. The resource views (AlbumList, pagination, filters) still rely
// on Material-UI's theme via useMediaQuery, so the shell must provide it or
// those views crash reading `theme.breakpoints` off null. The bespoke screens
// use plain CSS tokens and don't need it, but the wrapper is harmless to them.
const Layout = ({ children }) => {
  const themeConfig = useCurrentTheme()
  const theme = useMemo(() => createTheme(themeConfig), [themeConfig])
  const [queueOpen, setQueueOpen] = useState(false)
  const [search, setSearch] = useState('')
  useKeyboardShortcuts()

  return (
    <ThemeProvider theme={theme}>
      <div className="nd-app">
        <TopBar
          search={search}
          onSearch={setSearch}
          queueOpen={queueOpen}
          onToggleQueue={() => setQueueOpen((o) => !o)}
        />
        <OfflineBanner />
        <div className="nd-mid">
          <main className="nd-scroll" aria-label="Contenido principal">
            {children}
          </main>
          <QueueDrawer open={queueOpen} />
        </div>
        <PlayerBar onToggleQueue={() => setQueueOpen((o) => !o)} />
        <Notification />
        <Dialogs />
      </div>
    </ThemeProvider>
  )
}

export default Layout
