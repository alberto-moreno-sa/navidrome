import { useGetList } from 'react-admin'

// Total row count for a resource via the native list API (perPage 1 — we only
// need the total header). Shared by the library sidebar and the admin metrics.
export const useCount = (resource, filter) => {
  const { total } = useGetList(
    resource,
    { page: 1, perPage: 1 },
    { field: 'id', order: 'ASC' },
    filter || {},
  )
  return total || 0
}

export default useCount
