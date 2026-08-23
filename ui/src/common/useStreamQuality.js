import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { detectBrowserProfile, decisionService } from '../transcode'
import { setTranscodingProfile } from '../actions'
import { getStreamQuality, setStreamQuality, applyQualityToProfile } from './streamQuality'

// Read/write the streaming-quality preference and push it into the transcode
// pipeline. Changing it rebuilds the browser profile with the new bitrate cap,
// swaps it into the decision service, and clears cached decisions so the next
// track is resolved with the new setting. The current track keeps playing at
// its current quality (changing it mid-stream would interrupt playback).
export const useStreamQuality = () => {
  const dispatch = useDispatch()
  const [quality, setQuality] = useState(getStreamQuality())

  const change = (q) => {
    if (q === quality) return
    setStreamQuality(q)
    setQuality(q)
    const profile = applyQualityToProfile(detectBrowserProfile(), q)
    decisionService.setProfile(profile)
    decisionService.invalidateAll()
    dispatch(setTranscodingProfile(profile))
  }

  return [quality, change]
}

export default useStreamQuality
