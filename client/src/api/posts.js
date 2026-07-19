import { request } from './http.js';

export const fetchPosts = () => request('/api/posts');
export const fetchPost = (id) => request(`/api/posts/${id}`);
export const createPost = (data) => request('/api/posts', { method: 'POST', body: data });
export const updatePost = (id, data) =>
  request(`/api/posts/${id}`, { method: 'PUT', body: data });
export const deletePost = (id) => request(`/api/posts/${id}`, { method: 'DELETE' });
