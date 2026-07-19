import { request } from './http.js';

export const fetchComments = (postId) => request(`/api/posts/${postId}/comments`);
export const createComment = (postId, data) =>
  request(`/api/posts/${postId}/comments`, { method: 'POST', body: data });
export const deleteComment = (id) => request(`/api/comments/${id}`, { method: 'DELETE' });
