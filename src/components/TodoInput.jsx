import { useLayoutEffect, useRef, useState } from "react";

export function TodoInput({ onAdd, placeholder = "Add new task" }) {
  const [value, setValue] = useState("");
  const ref = useRef(null);

  // Grow / shrink the field to fit its content (capped at 3 lines by max-h-[88px]:
  // 3 lines x 22px + 20px padding + 2px border)
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    // scrollHeight excludes the border, so add it back (box-sizing: border-box)
    el.style.height = `${el.scrollHeight + (el.offsetHeight - el.clientHeight)}px`;
  }, [value]);

  const submit = () => {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  // Enter adds the task, Shift+Enter inserts a new line
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        className="block min-w-0 flex-1 max-h-22 resize-none overflow-y-auto border-b-2 border-neutral-300 bg-transparent py-2.5 text-base leading-5.5 text-neutral-800 outline-none wrap-anywhere placeholder:text-neutral-400 focus-visible:border-neutral-700"
      />
      <button
        type="submit"
        aria-label="Add task"
        className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-neutral-700 text-white hover:bg-neutral-800 active:scale-95  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}