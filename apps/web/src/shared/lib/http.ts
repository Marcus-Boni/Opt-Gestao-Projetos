import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  withCredentials: true,
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      window.location.pathname.startsWith('/app')
    ) {
      const redirect = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
      window.location.replace(`/login?redirect=${redirect}`);
    }

    return Promise.reject(error instanceof Error ? error : new Error('Erro HTTP'));
  },
);
