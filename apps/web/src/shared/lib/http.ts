import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  withCredentials: true,
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(error instanceof Error ? error : new Error('Erro HTTP')),
);
