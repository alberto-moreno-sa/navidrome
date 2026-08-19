import { useEffect, useState } from 'react'
import { useDataProvider } from 'react-admin'

// Accumulating paged list over the native dataProvider. Fetches one page at a
// time and appends, so a 11k-song view starts light and grows as the user asks
// for more — instead of the old fixed 120-row cap. Resets cleanly whenever the
// resource / sort / filter changes (adjust-state-during-render pattern, so the
// first page of the new query is the only fetch).
export const useInfiniteList = (resource, sort, filter, pageSize = 100) => {
  const dataProvider = useDataProvider()
  const key = JSON.stringify({ resource, sort, filter })

  const [page, setPage] = useState(1)
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [curKey, setCurKey] = useState(key)

  if (key !== curKey) {
    setCurKey(key)
    setPage(1)
    setRecords([])
    setTotal(0)
    setLoading(true)
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    dataProvider
      .getList(resource, {
        pagination: { page, perPage: pageSize },
        sort,
        filter,
      })
      .then(({ data, total: t }) => {
        if (cancelled) return
        setTotal(t || 0)
        setRecords((prev) => (page === 1 ? data : [...prev, ...data]))
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // resource/sort/filter are folded into curKey; pageSize/dataProvider are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curKey, page])

  const hasMore = records.length < total
  const loadMore = () => {
    if (hasMore && !loading) setPage((p) => p + 1)
  }

  return { records, total, loading, hasMore, loadMore }
}

export default useInfiniteList
