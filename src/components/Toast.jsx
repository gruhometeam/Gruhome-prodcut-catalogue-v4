export default function Toast({ text }) {
  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <div className="bg-[#2B2B2B] text-[#F4ECD8] text-[12.5px] font-medium px-4 py-2.5 rounded-xl shadow-xl text-center max-w-xs opacity-95">
        {text}
      </div>
    </div>
  );
}
