import { API_BASE } from '../api'
import { useEffect, useMemo, useState } from 'react'

export function Studies({ query }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => { setPage(1) }, [query])

  useEffect(() => {
    if (!query) return
    let alive = true
    const ac = new AbortController()
    ;(async () => {
      setLoading(true)
      setErr('')
      try {
        const url = `${API_BASE}/query/${encodeURIComponent(query)}/studies`
        const res = await fetch(url, { signal: ac.signal })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
        if (!alive) return
        const list = Array.isArray(data?.results) ? data.results : []
        setRows(list)
      } catch (e) {
        if (!alive) return
        setErr(`Failed to fetch studies: ${e?.message || e}`)
        setRows([])
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false; ac.abort() }
  }, [query])

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)

  const highlightText = (text, keywords) => {
    if (!keywords.length || !text) return text
    const regex = new RegExp(`(${keywords.join('|')})`, 'gi')
    return text.split(regex).map((part, i) =>
      regex.test(part)
        ? (
          <mark
            key={i}
            style={{
              backgroundColor: '#92cbdf',
              borderRadius: '12px',
              padding: '0 6px',
              margin: '0 2px',
              display: 'inline-block'
            }}
          >
            {part}
          </mark>
        )
        : part
    )
  }

  const keywords = useMemo(() => {
    return (query.match(/[a-zA-Z]+/g) || []).map(k => k.toLowerCase())
  }, [query])

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>Studies</div>
        {query && (
          <div className="text-sm text-gray-600">
            Page <b>{page}</b> / <b>{totalPages}</b>, Total <b>{rows.length}</b> records
          </div>
        )}
      </div>

      {/* Outer container */}
      <div className="rounded-xl px-8 py-10 bg-white">
        {loading && (
          <div className="grid gap-3 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        )}

        {err && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {!loading && !err && query && (
          <>
            {pageRows.length === 0 ? (
              <div className="text-sm text-gray-500 px-3 py-2">No results found.</div>
            ) : (
              // === 卡片清單 ===
              <div className="flex flex-col items-center w-full">
                {pageRows.map((r, i) => (
                  <div
                    key={i}
                    className="studies-card w-full max-w-4xl border border-gray-200 cursor-default mb-8 last:mb-0"
                  >
                    {/* Year + Journal */}
                    <div className="studies-card-meta mb-2 leading-relaxed tracking-wide">
                      <b>{r.year}</b>．<b>{r.journal || '(no journal)'}</b>
                    </div>

                    {/* Title */}
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${r.study_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in PubMed ↗"
                      className="studies-card-title mb-3 leading-relaxed tracking-wide hover:text-teal-700"
                      style={{ display: 'block', textDecoration: 'none' }}
                    >
                      {highlightText(r.title || '', keywords)}
                    </a>

                    {/* Authors */}
                    <div className="studies-card-authors mb-3 leading-relaxed tracking-wide">
                      {r.authors || '(no authors)'}
                    </div>

                    {/* Footer */}
                    <div className="studies-card-footer flex items-center justify-between text-xs border-t pt-2 mt-2 leading-relaxed tracking-wide">
                      <div className="flex gap-4">
                        {r.study_id && <div>STUDY ID : {r.study_id}</div>}
                        {r.contrast && <div><b>CONTRAST:</b> {r.contrast}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {rows.length > pageSize && (
              <div className="flex items-center justify-between border-t pt-3 mt-6 text-sm">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="rounded-lg border bg-white px-3 py-1 disabled:opacity-40 hover:bg-gray-50"
                >
                  ← Previous
                </button>
                <div>Page <b>{page}</b> / <b>{totalPages}</b></div>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="rounded-lg border bg-white px-3 py-1 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
