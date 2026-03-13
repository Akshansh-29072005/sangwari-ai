/**
 * Sangwari AI — Backend API Configuration
 *
 * Set your backend base URL here. All API route modules
 * import this config so you only need to change it in one place.
 */

// Change this to your backend URL (e.g. http://192.168.x.x:8000 for local dev)
export const API_BASE_URL = 'http://localhost:8000';

// Default request timeout in milliseconds
export const API_TIMEOUT = 15000;

// Common headers for all requests
export const defaultHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  // Add auth token here once implemented:
  // 'Authorization': `Bearer ${getToken()}`,
});

/**
 * Centralized fetch wrapper with timeout and error handling.
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ data: T | null; error: string | null; status: number }> {
  const url = `${API_BASE_URL}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...defaultHeaders(), ...(options.headers as Record<string, string>) },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return { data: null, error: data?.message || `Request failed (${response.status})`, status: response.status };
    }

    return { data, error: null, status: response.status };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return { data: null, error: 'Request timed out', status: 0 };
    }
    return { data: null, error: err.message || 'Network error', status: 0 };
  }
}
