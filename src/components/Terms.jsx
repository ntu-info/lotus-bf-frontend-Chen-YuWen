import { API_BASE } from '../api'
import { useEffect, useMemo, useState } from 'react'

export function Terms({ onPickTerm }) {
  const [terms, setTerms] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    let alive = true
    const ac = new AbortController()
    const load = async () => {
      setLoading(true)
      setErr('')
      try {
        const res = await fetch(`${API_BASE}/terms`, { signal: ac.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!alive) return
        setTerms(Array.isArray(data?.terms) ? data.terms : [])
      } catch (e) {
        if (!alive) return
        setErr(`Failed to fetch terms: ${e?.message || e}`)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false; ac.abort() }
  }, [])

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    if (!s) return terms
    return terms.filter(t => t.toLowerCase().includes(s))
  }, [terms, search])

  return (
    <div className="terms">
      {/* 說明文字 */}
      <div
        style={{
          fontSize: '14px',
          color: '#64748b',
          marginTop: '1px',
          marginBottom: '8px',
          lineHeight: '1.4',
        }}
      >
        Click terms to append it to the query.
      </div>

      {/* 搜尋框 + Clear 按鈕 */}
      <div className="flex items-center gap-3 w-full mb-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms…"
          className="searchbox w-full"
        />
        <button
          onClick={() => setSearch('')}
          style={{
              fontSize: '40px',   
              fontWeight: 900,       
          }}
          className="rounded-lg bg-blue-600 text-white px-3 py-1.5 shadow-sm hover:bg-blue-700 active:scale-95 transition-transform"
        >
          Clear
        </button>
      </div>

      {/* Terms 列表 */}
      {loading && (
        <div className="terms__skeleton">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="terms__skeleton-row" />
          ))}
        </div>
      )}

      {err && <div className="alert alert--error">{err}</div>}

      {!loading && !err && (
        <div className="terms__list">
          {filtered.length === 0 ? (
            <div className="terms__empty text-center text-gray-500">No terms found</div>
          ) : (
            <table
              className="table-auto w-full border-collapse text-center"
              style={{ marginTop: '4px' }}
            >
              <tbody>
                {filtered.slice(0, 500).map((t, idx) => (
                  <tr key={`${t}-${idx}`}>
                    <td className="border-b px-3 py-2 text-center">
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                        title={t}
                        aria-label={`Add term ${t}`}
                        onClick={(e) => {
                          e.preventDefault()
                          onPickTerm?.(t)
                        }}
                      >
                        {t}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
