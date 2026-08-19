import subsonic from '../subsonic'

// Cover art URL from the fork's Subsonic client. `record` is any album/artist/
// song with an id; size is the square px requested from getCoverArt.
export const coverUrl = (record, size = 300) => {
  if (!record || !record.id) return undefined
  try {
    return subsonic.getCoverArtUrl(record, size, true)
  } catch (e) {
    return undefined
  }
}

// Resolution chip text ("24 · 96") when the record carries audio properties.
// Albums do not always expose this; return null and the chip is omitted.
export const resolution = (record) => {
  if (!record) return null
  const bits = record.bitDepth || record.maxBitDepth
  const rateHz = record.sampleRate || record.maxSampleRate
  if (!rateHz) return null
  const khz = Math.round((rateHz / 1000) * 10) / 10
  return bits ? `${bits} · ${khz}` : `${khz}`
}
