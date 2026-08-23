import { useEffect, useState } from 'react'
import { useDataProvider } from 'react-admin'
import { resolution } from './covers'

// Option A: derive an album's audio codification in the UI. Album records don't
// expose codec / bit depth / sample rate, so we fetch one representative track
// (album_id filter, one row) and read its format + resolution. The work is
// deferred to idle time so it never blocks paint, results are cached per album
// id (module scope), and in-flight requests are de-duplicated — scrolling back
// and forth costs nothing and each album is fetched at most once per session.
const cache = new Map()
const inflight = new Map()

const LOSSLESS = ['FLAC', 'ALAC', 'WAV', 'AIFF', 'APE', 'WV', 'DSF', 'DSD']

const infoFor = (song) => {
  if (!song) return { res: null, format: null, lossless: false }
  const format = (song.suffix || '').toUpperCase() || null
  return { res: resolution(song), format, lossless: !!format && LOSSLESS.includes(format) }
}

const idle = (fn) =>
  typeof window !== 'undefined' && window.requestIdleCallback
    ? window.requestIdleCallback(fn, { timeout: 2000 })
    : setTimeout(fn, 200)

const cancelIdle = (h) =>
  typeof window !== 'undefined' && window.cancelIdleCallback
    ? window.cancelIdleCallback(h)
    : clearTimeout(h)

const EMPTY = { res: null, format: null, lossless: false }

export const useAlbumResolution = (album, enabled = true) => {
  const dataProvider = useDataProvider()
  const albumId = album && album.id
  const direct = resolution(album)
  const [info, setInfo] = useState(
    albumId && cache.has(albumId)
      ? cache.get(albumId)
      : direct
        ? { res: direct, format: null, lossless: false }
        : EMPTY,
  )

  useEffect(() => {
    if (!enabled || !albumId) return undefined
    if (cache.has(albumId)) {
      setInfo(cache.get(albumId))
      return undefined
    }

    let cancelled = false
    const handle = idle(() => {
      let p = inflight.get(albumId)
      if (!p) {
        p = dataProvider
          .getList('song', {
            filter: { album_id: albumId },
            pagination: { page: 1, perPage: 1 },
            sort: { field: 'trackNumber', order: 'ASC' },
          })
          .then(({ data }) => {
            const r = infoFor(data && data[0])
            cache.set(albumId, r)
            return r
          })
          .catch(() => {
            cache.set(albumId, EMPTY)
            return EMPTY
          })
          .finally(() => inflight.delete(albumId))
        inflight.set(albumId, p)
      }
      p.then((r) => {
        if (!cancelled) setInfo(r)
      })
    })

    return () => {
      cancelled = true
      cancelIdle(handle)
    }
  }, [albumId, enabled, dataProvider])

  return info
}
