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
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [openDropdown])

  if (!filterSpecs || filterSpecs.length === 0) {
    return null
  }

  return (
    <div ref={containerRef} className="w-full relative">
      <div
        className="flex flex-row flex-nowrap overflow-x-auto gap-3 items-center py-2 -my-2 pb-80 -mb-80"
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          overflowY: 'visible',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '320px',
          marginBottom: '-320px'
        }}
      >
        <style dangerouslySetInnerHTML={{
          __html: `
          .flex-nowrap::-webkit-scrollbar { display: none; }
          .flex-row { display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; }
          .dropdown-container { display: flex !important; flex-direction: column !important; width: 100% !important; }
          .dropdown-item { display: flex !important; width: 100% !important; white-space: normal !important; }
        `}} />
        {filterSpecs.map((spec) => {
          const selectedValues = Array.isArray(selectedFilters[spec.key])
            ? selectedFilters[spec.key]
            : (selectedFilters[spec.key] ? [selectedFilters[spec.key]] : []);

          const isActive = selectedValues.length > 0;

          return (
            <div key={spec.key} className="relative flex-shrink-0">
              <button
                onClick={() => setOpenDropdown(openDropdown === spec.key ? null : spec.key)}
                className={`px-4 py-2 flex items-center gap-2 text-[#2B2B2B] font-medium text-[13px] bg-white border border-[#C8C2B8] rounded-lg hover:bg-[#F4ECD8] transition-all whitespace-nowrap shadow-sm ${isActive ? 'border-[#8A9A5B] text-[#8A9A5B] bg-[#8A9A5B]/5' : ''
                  }`}
              >
                {isActive
                  ? `${spec.label} (${selectedValues.length})`
                  : spec.label}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === spec.key ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === spec.key && (
                <div
                  className="absolute top-full mt-2 left-0 bg-white border border-[#C8C2B8] rounded-lg shadow-2xl z-[9999] overflow-y-auto w-[240px]"
                  style={{
                    maxHeight: '320px',
                    display: 'block'
                  }}
                >
                  <div className="dropdown-container py-1">
                    <button
                      onClick={() => {
                        onFilterChange(spec.key, null)
                        setOpenDropdown(null)
                      }}
                      className="dropdown-item text-left px-4 py-2 text-[12px] text-[#2B2B2B]/50 hover:bg-[#F4ECD8] border-b border-[#C8C2B8]/10"
                    >
                      Clear Category
                    </button>
                    {spec.options.map((value) => (
                      <label
                        key={value}
                        className="dropdown-item items-center gap-3 px-4 py-2.5 hover:bg-[#F4ECD8] cursor-pointer transition-colors border-b border-[#C8C2B8]/5 last:border-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedValues.includes(value)}
                          onChange={() => {
                            onFilterChange(spec.key, value)
                          }}
                          className="w-4 h-4 accent-[#8A9A5B] flex-shrink-0"
                        />
                        <span className="text-[13px] text-[#2B2B2B] break-words leading-tight flex-1">
                          {value}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  )
}
