import React, { useEffect, useState } from 'react'
import Icon from '../common/Icon'

// Thin banner shown when the browser goes offline. Playback of already-cached
// audio keeps working; this only informs the user that live data is paused.
const OfflineBanner = () => {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (online) return null
  return (
    <div className="nd-offline" role="status" aria-live="polite">
      <Icon name="wifiOff" size={16} />
      Offline — playback continues from what's already cached.
    </div>
  )
}

export default OfflineBanner
