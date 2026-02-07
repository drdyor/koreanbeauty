import { API_CONFIG } from './config';
import { ApiError } from '../errors/api-error';
import { getToken, clearSession } from '../auth/session';
import { mockData } from './mock-server';

// Add delay to simulate network requests
function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Build URL with query params
function buildUrl(endpoint: string, params?: Record<string, unknown>): string {
  const baseUrl = API_CONFIG.baseUrl;
  const url = new URL(endpoint.startsWith('/') ? endpoint : `/${endpoint}`, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, String(v)));
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    });
  }

  return url.toString();
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  params?: Record<string, unknown>;
}

async function fetchWithRetry(
  url: string,
  options: RequestOptions = {},
  attempt: number = 0
): Promise<Response> {
  const {
    timeout = API_CONFIG.timeout,
    retries = API_CONFIG.retryAttempts,
    ...fetchOptions
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Retry on 5xx errors
    if (response.status >= 500 && attempt < retries) {
      await delay(API_CONFIG.retryDelay * (attempt + 1));
      return fetchWithRetry(url, options, attempt + 1);
    }

    return response;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw ApiError.timeout();
    }

    if (attempt < retries) {
      await delay(API_CONFIG.retryDelay * (attempt + 1));
      return fetchWithRetry(url, options, attempt + 1);
    }

    const message = error instanceof Error ? error.message : 'Network error';
    throw ApiError.networkError(message);
  }
}

export const apiClient = {
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    // Use mocks in development if configured
    if (API_CONFIG.useMocks) {
      await delay();
      return getMockResponse<T>(endpoint, options);
    }

    // Build URL with query params
    const url = buildUrl(endpoint, options.params);
    const token = getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetchWithRetry(url, {
      ...options,
      headers,
    });

    let data: unknown;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw ApiError.fromResponse(response, data);
    }

    return data as T;
  },

  // Mock response handler for development
  getMockResponse<T>(endpoint: string, options: RequestOptions = {}): T {
    if (endpoint.includes('/dashboard/stats')) {
      return mockData.dashboard.stats as T;
    }

    if (endpoint.includes('/dashboard/charts')) {
      return [] as T;
    }

    if (endpoint.includes('/users') && options.method !== 'POST') {
      return mockData.users.list as T;
    }

    if (endpoint.includes('/symptoms')) {
      if (options.method === 'GET') {
        return {
          items: mockData.wellness.symptoms,
          total: mockData.wellness.symptoms.length,
        } as T;
      }
      if (options.method === 'POST') {
        const bodyObj = typeof options.body === 'object' && options.body !== null ? options.body : {};
        const newSymptom = { id: Date.now().toString(), ...(bodyObj as Record<string, unknown>) };
        (mockData.wellness.symptoms as any[]).push(newSymptom);
        return newSymptom as T;
      }
    }

    if (endpoint.includes('/medications')) {
      if (options.method === 'GET') {
        return mockData.wellness.medications as T;
      }
      if (options.method === 'POST') {
        const medBodyObj = typeof options.body === 'object' && options.body !== null ? options.body : {};
        const newMedication = { id: Date.now().toString(), ...(medBodyObj as Record<string, unknown>) };
        (mockData.wellness.medications as any[]).push(newMedication);
        return newMedication as T;
      }
    }

    if (endpoint.includes('/patterns')) {
      return mockData.wellness.patterns as T;
    }

    if (endpoint.includes('/providers')) {
      return mockData.wellness.providers as T;
    }

    if (endpoint.includes('/quick-checkin')) {
      return mockData.wellness.symptoms as T;
    }

    // Default fallback - return empty data
    return {} as T;
  },

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return apiClient.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return apiClient.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  async postForm<T>(
    endpoint: string,
    body: Record<string, string>,
    options?: RequestOptions
  ): Promise<T> {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    const token = getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(options?.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetchWithRetry(url, {
      ...options,
      method: 'POST',
      headers,
      body: new URLSearchParams(body).toString(),
    });

    let data: unknown;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw ApiError.fromResponse(response, data);
    }

    return data as T;
  },

  patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return apiClient.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return apiClient.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return apiClient.request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

// Mock response handler for development
function getMockResponse<T>(endpoint: string, options: RequestOptions = {}): T {
  if (endpoint.includes('/dashboard/stats')) {
    return mockData.dashboard.stats as T;
  }

  if (endpoint.includes('/dashboard/charts')) {
    return [] as T;
  }

  if (endpoint.includes('/users') && options.method !== 'POST') {
    return mockData.users.list as T;
  }

  if (endpoint.includes('/symptoms')) {
    if (options.method === 'GET') {
      return {
        items: mockData.wellness.symptoms,
        total: mockData.wellness.symptoms.length,
      } as T;
    }
    if (options.method === 'POST') {
      const bodyObj = typeof options.body === 'object' && options.body !== null ? options.body : {};
        const newSymptom = { id: Date.now().toString(), ...(bodyObj as Record<string, unknown>) };
      (mockData.wellness.symptoms as any[]).push(newSymptom);
      return newSymptom as T;
    }
  }

  if (endpoint.includes('/medications')) {
    if (options.method === 'GET') {
      return mockData.wellness.medications as T;
    }
    if (options.method === 'POST') {
      const medBodyObj = typeof options.body === 'object' && options.body !== null ? options.body : {};
        const newMedication = { id: Date.now().toString(), ...(medBodyObj as Record<string, unknown>) };
      (mockData.wellness.medications as any[]).push(newMedication);
      return newMedication as T;
    }
  }

  if (endpoint.includes('/patterns')) {
    return mockData.wellness.patterns as T;
  }

  if (endpoint.includes('/providers')) {
    return mockData.wellness.providers as T;
  }

  if (endpoint.includes('/quick-checkin')) {
    return mockData.wellness.symptoms as T;
  }

  // Default fallback - return empty data
  return {} as T;
}

export { ApiError };
