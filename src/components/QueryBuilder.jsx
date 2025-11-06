export function QueryBuilder({ query, setQuery }) {
  const append = (token) => setQuery((q) => (q ? `${q} ${token}` : token));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setQuery(e.currentTarget.value);
    }
  };

  return (
    <div className="flex flex-col gap-3 qb">
      {/* Header */}
      <div className="flex flex-col items-start">
        <div className="card__title">Query Builder</div>
        <div style={{ fontSize: '14px', color: '#64748b', marginTop: '1px', marginBottom: '8px', lineHeight: '1.4' }}>
          After entering terms, you can click AND / OR / NOT / ( ) to build your query.<br />
          <span style={{ display: 'block', marginTop: '4px' }}>The matching studies will be displayed.</span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full" style={{ minHeight: '28px' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Create a query here"
          className="searchbox"
        />
        <button
          onClick={() => setQuery('')}
          className="rounded-xl border px-4 py-2 text-sm bg-primary-600 text-white hover:bg-primary-700"
          style={{
              fontSize: '1.25rem',   
              fontWeight: 800,       
              minWidth: '64px',
          }}
        >
          Reset
        </button>
      </div>


      {/* Operators row */}
      <div className="flex justify-center flex-nowrap overflow-x-auto mt-2 mb-2">
        {[
          { label: 'AND', onClick: () => append('AND') },
          { label: 'OR', onClick: () => append('OR') },
          { label: 'NOT', onClick: () => append('NOT') },
          { label: '(', onClick: () => append('(') },
          { label: ')', onClick: () => append(')') },
        ].map((b) => (
          <button
            key={b.label}
            onClick={b.onClick}
            className="qb-logic-btn rounded-xl border px-5 py-2 text-sm mx-2"
            style={{
              fontSize: '3rem',     
              fontWeight: 700,     
            }}
          >
            {b.label}
          </button>
        ))}
      </div>


      {/* Tip (English) */}
      {/*<div className="text-xs text-gray-600">
        Tip: You can mix MNI locations in the query string, such as "[-22,-4,-18] NOT emotion" (without the quotes).
      </div>*/}

      {/* The "Current Query" row was removed per requirement #3. */}
    </div>
  );
}
