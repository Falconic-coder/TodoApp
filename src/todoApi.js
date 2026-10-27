const API = "http://localhost:3000";
const TIMEOUT = 10000; // ms before a request is treated as failed

const toTodo = (doc) => ({ id: doc._id, text: doc.task, done: doc.isDone });


async function request(path) {
  const res = await fetch(`${API}${path}`, { signal: AbortSignal.timeout(TIMEOUT) });
  if (!res.ok) throw new Error(`Request failed (${res.status}): ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}


let connected = false;

export async function connectDb() {
  if (connected) return;
  const res = await fetch(`${API}/`, { signal: AbortSignal.timeout(TIMEOUT) });
  const message = await res.text();
  if (!res.ok || message !== "MongoDB connected") {
    throw new Error(message || "Could not connect to the database");
  }
  connected = true;
}

export function resetConnection() {
  connected = false;
}

export async function fetchTodos(page = 1) {
  await connectDb();
  const data = await request(`/fetch/${page}`);
  return { todos: data.todos.map(toTodo), hasMore: data.hasMore };
}

// CREATE a todo  ->  returns the created todo
export async function createTodo(text) {
  await connectDb();
  const doc = await request(`/add/${encodeURIComponent(text)}`);
  return toTodo(doc);
}


export async function updateTodo(id, changes) {
  await connectDb();
  if ("text" in changes) {
    await request(`/update/${id}/${encodeURIComponent(changes.text)}`);
  }
  if ("done" in changes) {
    await request(`/update/${id}`);
  }
  return { id, ...changes };
}

// DELETE a todo
export async function deleteTodo(id) {
  await connectDb();
  await request(`/del/${id}`);
}