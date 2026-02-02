export default function FilterBar({ label, options, selected, onSelect }) {
  return (
    <div className="relative w-full">
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="appearance-none bg-white border border-[#C8C2B8] rounded-full px-5 py-2.5 pr-10 text-[13px] font-medium text-[#2B2B2B] cursor-pointer hover:border-[#8A9A5B] hover:bg-[#8A9A5B]/5 transition-all outline-none w-full"
      >
        <option value="">{label}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute top-full left-0 right-0 mt-[8px] bg-white border border-[#C8C2B8] rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.1)] max-h-[300px] overflow-y-auto overflow-x-hidden z-50 hidden group-hover:block border-opacity-100">
        {options.map(opt => (
          <div 
            key={opt} 
            onClick={() => onSelect(opt)}
            className="px-4 py-2 hover:bg-[#F4ECD8] cursor-pointer text-[13px] break-words whitespace-normal text-[#2B2B2B]"
          >
            {label}: {opt}
          </div>
        ))}
      </div>
    </div>
  );
}
