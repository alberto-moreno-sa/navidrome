import { useEffect, useState } from 'react'
import { decisionService } from '../transcode'

// What is ACTUALLY being played, from the engine's transcode decision — so the
// UI can tell the source file's quality apart from a transcoded stream. The
// decision (getTranscodeDecision) carries sourceStream + transcodeStream; when
// transcodeStream is present the audio is being re-encoded (e.g. FLAC → MP3),
// otherwise it direct-plays the original bit-perfect. Falls back to the song's
// own metadata until the decision lands (it is prefetched, so usually instant).
const khz = (hz) => (hz ? `${Math.round((hz / 1000) * 10) / 10} kHz` : null)
const fmtStream = (s) => {
  if (!s) return { format: null, detail: null }
  const format = (s.codec || s.container || '').toUpperCase()
  const lossy = /MP3|AAC|OPUS|OGG|VORBIS/.test(format)
  const detail = lossy
    ? s.audioBitrate
      ? `${Math.round(s.audioBitrate / 1000)} kbps`
      : null
    : [s.audioBitdepth ? `${s.audioBitdepth}-bit` : null, khz(s.audioSamplerate)]
        .filter(Boolean)
        .join(' · ') || null
  return { format, detail }
}

export const usePlaybackQuality = (id, song) => {
  const [decision, setDecision] = useState(null)

  useEffect(() => {
    if (!id) {
      setDecision(null)
      return undefined
    }
    let cancelled = false
    const read = () => {
      const d = decisionService.getCachedDecision(id)
      if (!cancelled && d) setDecision(d)
    }
    read()
    // The decision is prefetched but may land a beat after the track starts.
    const iv = setInterval(read, 500)
    const stop = setTimeout(() => clearInterval(iv), 5000)
    return () => {
      cancelled = true
      clearInterval(iv)
      clearTimeout(stop)
    }
  }, [id])

  const src = decision?.sourceStream
  const trc = decision?.transcodeStream
  const transcoded = !!trc

  if (decision && src) {
    const source = fmtStream(src)
    const play = transcoded ? fmtStream(trc) : source
    return {
      known: true,
      transcoded,
      playFormat: play.format,
      playDetail: play.detail,
      sourceFormat: source.format,
      sourceDetail: source.detail,
      reason: (decision.transcodeReason && decision.transcodeReason[0]) || null,
    }
  }

  // Fallback to the song's own tags (source only; transcode state unknown yet).
  const s = song || {}
  const format = (s.suffix || '').toUpperCase()
  const lossy = /MP3|AAC|OPUS|OGG/.test(format)
  const detail = lossy
    ? s.bitRate
      ? `${s.bitRate} kbps`
      : null
    : [s.bitDepth ? `${s.bitDepth}-bit` : null, khz(s.sampleRate)].filter(Boolean).join(' · ') || null
  return {
    known: false,
    transcoded: false,
    playFormat: format || null,
    playDetail: detail,
    sourceFormat: format || null,
    sourceDetail: detail,
    reason: null,
  }
}

export default usePlaybackQuality
