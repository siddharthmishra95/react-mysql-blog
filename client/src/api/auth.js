import { request } from './http.js';

export const register = (data) => request('/api/auth/register', { method: 'POST', body: data });
export const login = (data) => request('/api/auth/login', { method: 'POST', body: data });
export const fetchMe = () => request('/api/auth/me');
