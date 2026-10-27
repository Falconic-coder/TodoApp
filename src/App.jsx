import { useCallback, useEffect, useState, useRef } from "react";
import { TodoInput } from "./components/TodoInput";
import { TodoItem } from "./components/TodoItem";
import { ToastContainer, useToasts } from "./components/Toast";
import {
  connectDb,
  resetConnection,
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "./todoApi";

const MAX_ATTEMPTS = 4; // 1 try + 3 retries
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const dedupe = (list) => {
  const seen = new Set();
  return list.filter((t) => !seen.has(t.id) && seen.add(t.id));
};
 
export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // bump this to reload from the DB
  const { toasts, showToast, dismissToast } = useToasts();
 
  const pagesRef = useRef(1); // how many pages are currently on screen
  const versionRef = useRef(0); 
  const reloadingRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef(null); // invisible marker at the bottom of the list
 
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);
 
  
  useEffect(() => {
    let ignore = false; 
    versionRef.current += 1;
    reloadingRef.current = true;
 
    async function loadTodos() {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          await connectDb(); // reconnects only if the connection is dead
 
          const pages = pagesRef.current;
          let all = [];
          let more = false;
          let shown = 0;
          for (let page = 1; page <= pages; page++) {
            const data = await fetchTodos(page);
            if (ignore) return;
            all = all.concat(data.todos);
            more = data.hasMore;
            shown = page;
            if (!more) break; // fewer pages now (e.g. after deleting)
          }
 
          pagesRef.current = shown;
          setTodos(dedupe(all));
          setHasMore(more);
          setLoadMoreError(false);
          setConnectionError(false);
          setLoading(false);
          reloadingRef.current = false;
          return;
        } catch (err) {
          console.error(`DB attempt ${attempt}/${MAX_ATTEMPTS} failed`, err);
          resetConnection(); // force a fresh connection on the next attempt
          if (ignore) return;
 
          if (attempt === MAX_ATTEMPTS) {
            setConnectionError(true);
            setLoading(false);
            reloadingRef.current = false;
            return;
          }
          await wait(1000 * 2 ** (attempt - 1)); // backoff: 1s, 2s, 4s
          if (ignore) return;
        }
      }
    }
 
    loadTodos();
    return () => {
      ignore = true;
    };
  }, [refreshKey]);
 
  // Internet came back -> reload automatically
  useEffect(() => {
    window.addEventListener("online", refresh);
    return () => window.removeEventListener("online", refresh);
  }, [refresh]);
 
  // Fetch the next page (page 2, 3, ...) and add it to the bottom of the list
  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || reloadingRef.current) return;
    if (!hasMore || loading || connectionError || loadMoreError) return;
 
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const version = versionRef.current;
    try {
      await connectDb();
      const next = pagesRef.current + 1;
      const data = await fetchTodos(next);
      if (version !== versionRef.current) return; // a reload started meanwhile, drop this
      pagesRef.current = next;
      setTodos((prev) => dedupe([...prev, ...data.todos]));
      setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
      resetConnection();
      setLoadMoreError(true); // stops auto-retry; the Retry button clears it
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, loading, connectionError, loadMoreError]);
 
  
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading || loadingMore || loadMoreError || connectionError) return;
 
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "0px 0px 100px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [todos, hasMore, loading, loadingMore, loadMoreError, connectionError, loadMore]);
 
  const retry = () => {
    setConnectionError(false);
    setLoading(true);
    refresh();
  };
 
  const addTodo = async (text) => {
    try {
      await createTodo(text);
      showToast("Task added", "success");
      refresh();
    } catch (err) {
      console.error(err);
      resetConnection();
      showToast("Couldn't add task", "danger");
    }
  };
 
  const toggleTodo = async (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    try {
      await updateTodo(id, { done: !todo.done });
      showToast(
        todo.done ? "Task marked as not done" : "Task completed",
        todo.done ? "info" : "success"
      );
      refresh();
    } catch (err) {
      console.error(err);
      resetConnection();
      showToast("Couldn't update task", "danger");
    }
  };
 
  const removeTodo = async (id) => {
    try {
      await deleteTodo(id);
      showToast("Task removed", "danger");
      refresh();
    } catch (err) {
      console.error(err);
      resetConnection();
      showToast("Couldn't remove task", "danger");
    }
  };
 
  return (
    <section className="relative w-full max-w-130">
      <h2 className="mb-4 text-2xl font-extrabold sm:text-3xl tracking-tight text-neutral-900">Your To Do</h2>
 
      <div className="mb-5">
        <TodoInput onAdd={addTodo} />
      </div>
 
      {connectionError && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          <span>Can't reach the database.</span>
          <button
            type="button"
            onClick={retry}
            className="flex-none font-semibold underline underline-offset-2 hover:text-rose-950"
          >
            Retry
          </button>
        </div>
      )}
 
      {loading ? (
        <p className="text-sm text-neutral-400">Loading tasks…</p>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {todos.map((t) => (
              <TodoItem
                key={t.id}
                text={t.text}
                done={t.done}
                onToggle={() => toggleTodo(t.id)}
                onRemove={() => removeTodo(t.id)}
              />
            ))}
          </ul>
 
          {/* Invisible marker: reaching it triggers the next page */}
          {hasMore && <div ref={sentinelRef} className="h-px" aria-hidden="true" />}
 
          {loadingMore && (
            <p className="mt-4 text-center text-sm text-neutral-400">Loading more…</p>
          )}
 
          {loadMoreError && (
            <p className="mt-4 text-center text-sm text-rose-700">
              Couldn't load more tasks.{" "}
              <button
                type="button"
                onClick={() => setLoadMoreError(false)}
                className="font-semibold underline underline-offset-2"
              >
                Retry
              </button>
            </p>
          )}
        </>
      )}
 
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </section>
  );
}
 