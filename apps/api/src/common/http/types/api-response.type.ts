export interface ApiSuccessResponse<T> {
  success: true;
  requestId: string | null;
  timestamp: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  requestId: string | null;
  timestamp: string;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
