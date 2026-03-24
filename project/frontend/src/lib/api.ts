export const API_BASE_URL = "http://localhost:5001/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

/**
 * Hàm fetch tổng quát cho tất cả API calls.
 * - Tự động thêm Content-Type: application/json khi có body
 * - Ném ApiError nếu response không thành công
 * - Trả về dữ liệu đã parse JSON
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  { body, headers, ...options }: FetchOptions = {},
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `HTTP error ${response.status}`;
    try {
      const errData = await response.json();
      message = errData.message ?? errData.error ?? message;
    } catch {
      // bỏ qua lỗi parse
    }
    throw new ApiError(response.status, message);
  }

  // Trả về undefined cho 204 No Content
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

// ── Convenience wrappers ────────────────────────────────────────────────────

export const apiGet = <T = unknown>(
  endpoint: string,
  options?: Omit<FetchOptions, "body" | "method">,
) => apiFetch<T>(endpoint, { ...options, method: "GET" });

export const apiPost = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: Omit<FetchOptions, "body" | "method">,
) => apiFetch<T>(endpoint, { ...options, method: "POST", body });

export const apiPatch = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: Omit<FetchOptions, "body" | "method">,
) => apiFetch<T>(endpoint, { ...options, method: "PATCH", body });

export const apiPut = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: Omit<FetchOptions, "body" | "method">,
) => apiFetch<T>(endpoint, { ...options, method: "PUT", body });

export const apiDelete = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: Omit<FetchOptions, "body" | "method">,
) => apiFetch<T>(endpoint, { ...options, method: "DELETE", body });
