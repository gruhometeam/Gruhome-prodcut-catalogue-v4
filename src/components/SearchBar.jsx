import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="flex flex-row items-center w-full px-5 bg-[#F4ECD8] h-[64px] border-none outline-none">
      <div className="flex items-center justify-center flex-shrink-0">
        <Search className="h-6 w-6 text-[#2B2B2B]/40" />
      </div>
      <input
        type="text"
        className="flex-1 h-full ml-4 bg-transparent text-[#2B2B2B] placeholder-[#2B2B2B]/30 focus:outline-none text-[18px] font-medium leading-[64px]"
        placeholder={placeholder || "Search..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: 'none',
          outline: 'none',
          display: 'block',
          width: '100%',
          minWidth: 0,
          flexGrow: 1
        }}
      />
    </div>
  );
}
