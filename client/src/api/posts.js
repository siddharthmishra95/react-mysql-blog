// Thin wrapper around the posts API. Uses the Vite dev proxy (/api -> :3001).
const BASE = '/api/posts';

async function handle(res) {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function fetchPosts() {
  return fetch(BASE).then(handle);
}

export function fetchPost(id) {
  return fetch(`${BASE}/${id}`).then(handle);
}

export function createPost(data) {
  return fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle);
}

export function updatePost(id, data) {
  return fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle);
}

export function deletePost(id) {
  return fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handle);
}
