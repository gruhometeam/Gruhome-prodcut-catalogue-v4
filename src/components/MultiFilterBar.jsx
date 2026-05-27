import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export default function MultiFilterBar({ filterSpecs, selectedFilters, onFilterChange }) {
  const [openDropdown, setOpenDropdown] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpenDropdown(null)
      }
    }
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdown])

  if (!filterSpecs || filterSpecs.length === 0) return null

  return (
    // overflow-visible so absolute dropdowns are never clipped.
    <div ref={containerRef} className="w-full relative">
      <div className="flex flex-row flex-wrap gap-2 items-center">
        {filterSpecs.map((spec) => {
          const selectedValues = Array.isArray(selectedFilters[spec.key])
            ? selectedFilters[spec.key]
            : (selectedFilters[spec.key] ? [selectedFilters[spec.key]] : [])
          const isActive = selectedValues.length > 0

          return (
            <div key={spec.key} className="relative flex-shrink-0">
              <button
                onClick={() => setOpenDropdown(openDropdown === spec.key ? null : spec.key)}
                className={`px-4 py-2 flex items-center gap-2 font-medium text-[13px] bg-[#1C1C1E] border rounded-lg whitespace-nowrap shadow-sm transition-colors [touch-action:manipulation] ${
                  isActive
                    ? 'border-[#C5DE7A] text-[#C5DE7A] bg-[#C5DE7A]/10'
                    : 'border-white/10 text-white hover:bg-white/[0.06]'
                }`}
              >
                {isActive ? `${spec.label} (${selectedValues.length})` : spec.label}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === spec.key ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === spec.key && (
                <div className="absolute top-full mt-2 left-0 bg-[#1C1C1E] border border-white/10 rounded-lg shadow-2xl z-[9999] overflow-y-auto w-[240px]"
                  style={{ maxHeight: '320px' }}>
                  <div className="py-1">
                    <button
                      onClick={() => { onFilterChange(spec.key, null); setOpenDropdown(null) }}
                      className="w-full text-left px-4 py-2 text-[12px] text-white/50 hover:bg-white/[0.06] border-b border-white/[0.04]"
                    >
                      Clear {spec.label}
                    </button>
                    {spec.options.map((value) => (
                      <label
                        key={value}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.06] cursor-pointer transition-colors border-b border-white/[0.04] last:border-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedValues.includes(value)}
                          onChange={() => onFilterChange(spec.key, value)}
                          className="w-4 h-4 accent-[#C5DE7A] flex-shrink-0"
                        />
                        <span className="text-[13px] text-white break-words leading-tight flex-1">
                          {value}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
