const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');

const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};

const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      window.location.href = '/login';
      return null;
    }
    const json = await res.json();
    setTokens(json.data.accessToken, json.data.refreshToken);
    return json.data.accessToken;
  } catch {
    clearTokens();
    window.location.href = '/login';
    return null;
  }
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (isRefreshing) {
      return new Promise(resolve => {
        refreshSubscribers.push(async (newToken) => {
          const retryRes = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers: { ...headers, Authorization: `Bearer ${newToken}` },
          });
          resolve(retryRes.json());
        });
      });
    }

    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;

    if (!newToken) throw new Error('Session expired');

    onRefreshed(newToken);

    const retryRes = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${newToken}` },
    });

    const retryJson = await retryRes.json();
    if (!retryRes.ok) throw new Error(retryJson.error || 'Request failed');
    return retryJson.data;
  }

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json.data;
}

async function uploadFormData<T>(path: string, formData: FormData): Promise<T> {
  const doUpload = async (token: string | null) => {
    return fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
  };

  let res = await doUpload(getToken());

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) throw new Error('Session expired');
    res = await doUpload(newToken);
  }

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Upload failed');
  return json.data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) => uploadFormData<T>(path, formData),
  setTokens,
  clearTokens,
  getToken,
};

export default api;
