// Bridges the hidden react-jinke engine to the bespoke player bar. The engine
// owns audio, queue, gapless, media session, scrobble, keepalive and transcode;
// the bar reads the shared audioInstance from here and drives it.
let instance = null
const listeners = new Set()

export const setAudioInstance = (inst) => {
  instance = inst
  listeners.forEach((l) => l(inst))
}
export const getAudioInstance = () => instance
export const subscribeAudioInstance = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
