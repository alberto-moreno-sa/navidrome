// Tracks whether the current queue is an "endless shuffle" across the library.
// Queuing all ~11k songs at once freezes the UI (the engine builds every audio
// list item, parsing lyrics, synchronously), so instead we queue a batch and
// append more random songs as playback nears the end — effectively shuffling
// the whole library without ever holding it all at once. A module ref keeps
// this out of redux; the normal play paths clear it so appends never leak into
// an album/playlist/single-song queue.
let ctx = { active: false, filter: null }

export const setShuffleContext = (filter) => {
  ctx = { active: true, filter: filter || {} }
}

export const clearShuffleContext = () => {
  ctx = { active: false, filter: null }
}

export const getShuffleContext = () => ctx
