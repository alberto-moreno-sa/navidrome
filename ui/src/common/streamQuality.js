// User preference for streaming quality. The server honors the browser
// profile's maxTranscodingAudioBitrate, so we cap it here. "Original" removes
// the cap → the source direct-plays bit-perfect where the device supports it
// (e.g. FLAC on Chrome), transcoding only when the device can't play the
// source at all. The capped tiers force a transcode to that bitrate — useful
// on slow/metered connections.
const KEY = 'nd-stream-quality'

export const QUALITY_OPTIONS = [
  { value: 'original', label: 'Original', hint: 'Lossless where supported' },
  { value: '320', label: 'High', hint: '320 kbps' },
  { value: '192', label: 'Balanced', hint: '192 kbps' },
  { value: '96', label: 'Data saver', hint: '96 kbps' },
]

export const getStreamQuality = () => {
  const v = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null
  return QUALITY_OPTIONS.some((o) => o.value === v) ? v : 'original'
}

export const setStreamQuality = (q) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, q)
}

// Apply the preference to a detected browser profile before it is sent to the
// transcode-decision endpoint. Bitrate is expressed in bps for the API.
export const applyQualityToProfile = (profile, quality) => {
  if (!profile) return profile
  if (quality === 'original') {
    const next = { ...profile }
    delete next.maxTranscodingAudioBitrate
    return next
  }
  const kbps = parseInt(quality, 10)
  if (!kbps) return profile
  return { ...profile, maxTranscodingAudioBitrate: kbps * 1000 }
}
