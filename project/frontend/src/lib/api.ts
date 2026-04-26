export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001/api";

import type {
  Session,
  Message,
  LibraryResource,
  RescheduleRequest,
  Notification,
} from "../types";
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

// ── Response mappers (snake_case → camelCase) ───────────────────────────────

export function mapSession(r: Record<string, unknown>): Session {
  return {
    id: r.session_id as string,
    tutorId: r.tutor_id as string,
    subject: (r.subject ?? "") as string,
    date: r.date as string,
    startTime: r.start_time as string,
    endTime: r.end_time as string,
    type: r.type as "in-person" | "online",
    status: r.status as Session["status"],
    location: r.location as string | undefined,
    meetingLink: r.meeting_link as string | undefined,
    notes: r.notes as string | undefined,
    summary: r.summary as string | undefined,
    recordingUrl: r.recording_url as string | undefined,
    tutorName: r.tutorName as string | undefined,
    maxStudents: (r.max_students as number) ?? 0,
    enrolledStudents: (r.enrolledStudents as string[]) ?? [],
    reviews: (r.reviews as Session["reviews"]) ?? [],
  };
}

export function mapMessage(r: Record<string, unknown>): Message {
  return {
    id: (r.message_id ?? r.id) as string,
    senderId: (r.sender_id ?? r.senderId) as string,
    receiverId: (r.receiver_id ?? r.receiverId) as string,
    content: r.content as string,
    timestamp: r.timestamp as string,
    read: r.read as boolean,
    type: r.type as Message["type"],
    relatedSessionId: r.relatedSessionId as string | undefined,
  };
}

export function mapLibraryResource(
  r: Record<string, unknown>,
): LibraryResource {
  return {
    id: (r.resource_id ?? r.id) as string,
    title: r.title as string,
    type: r.type as LibraryResource["type"],
    subject: (r.subject ?? "") as string,
    author: (r.author ?? "") as string,
    url: (r.url ?? "") as string,
  };
}

export function mapNotification(r: Record<string, unknown>): Notification {
  return {
    id: (r.notification_id ?? r.id) as string,
    sessionId: (r.session_id ?? r.sessionId) as string,
    sentTime: (r.sent_time ?? r.sentTime) as string,
    content: r.content as string,
    type: (r.type ?? "") as string,
  };
}

export function mapRescheduleRequest(
  r: Record<string, unknown>,
): RescheduleRequest {
  return {
    id: (r.request_id ?? r.id) as string,
    sessionId: (r.session_id ?? r.sessionId) as string,
    requesterId: (r.student_id ?? r.requesterId) as string,
    requesterRole: "student",
    newDate: (r.proposed_date ?? r.newDate) as string,
    newStartTime: (r.proposed_start_time ?? r.newStartTime) as string,
    newEndTime: (r.proposed_end_time ?? r.newEndTime) as string,
    reason: (r.reason ?? "") as string,
    status: (r.status ?? "pending") as RescheduleRequest["status"],
    createdAt: (r.created_at ?? r.createdAt ?? "") as string,
  };
}
