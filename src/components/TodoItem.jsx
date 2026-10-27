export function TodoItem({ text, done, onToggle, onRemove }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-neutral-300 bg-white px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4">
      {/* Tick button */}
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? "Mark as not done" : "Mark as done"}
        onClick={onToggle}
        className="grid h-4.5 w-4.5 flex-none place-items-center rounded-sm border-[1.5px] border-neutral-500 bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
      >
        {done && (
          <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#222" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Text */}
      <span
        className={`min-w-0 flex-1 wrap-anywhere text-[15px] sm:text-base ${
          done ? "font-medium text-neutral-400 line-through" : "font-semibold text-neutral-800"
        }`}
      >
        {text}
      </span>

      {/* Cross button */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Delete task: ${text}`}
        className="-mr-1.5 grid h-9 w-9 flex-none place-items-center rounded-lg text-neutral-800 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </button>
    </li>
  );
}