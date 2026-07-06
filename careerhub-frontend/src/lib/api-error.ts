// ─────────────────────────────────────────────────────────────────────────
// Typed error foundation for every authenticated API call in CareerHub.
//
// Every authenticated fetch should throw an ApiError, never a plain Error.
// This lets error.tsx boundaries and mutation onError handlers branch on
// `error.code` / `error.isForbidden` etc. instead of parsing error.message
// strings, which is fragile and can't distinguish "session expired" from
// "you don't have permission" from "that job doesn't exist".
// ─────────────────────────────────────────────────────────────────────────

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION"
  | "SERVER_ERROR"
  | "UNKNOWN";

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly fields: Record<string, string[]> | undefined;

  constructor(
    message: string,
    status: number,
    code: ApiErrorCode,
    fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;

    // Restores the correct prototype chain when compiling to older JS
    // targets — without this, `error instanceof ApiError` can silently
    // return false in some TS/Babel transpilation setups because `Error`
    // subclasses lose their prototype when targeting ES5.
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  get isUnauthorized(): boolean {
    return this.code === "UNAUTHORIZED";
  }

  get isForbidden(): boolean {
    return this.code === "FORBIDDEN";
  }

  get isValidation(): boolean {
    return this.code === "VALIDATION";
  }
}

// Shape of an RFC 7807 Problem Details error response.
// `errors` is the ASP.NET Core convention for validation failures —
// each key is a field name, each value is an array of message strings.
interface ProblemDetailsBody {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

function codeFromStatus(status: number): ApiErrorCode {
  switch (status) {
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 422:
      return "VALIDATION";
    default:
      if (status >= 500) return "SERVER_ERROR";
      return "UNKNOWN";
  }
}

/**
 * Reads a Response's RFC 7807 Problem Details body (if any) and constructs
 * the appropriate ApiError. Safe to call on any non-ok Response, including
 * ones with no body (e.g. a 401 from middleware/auth with an empty response).
 */
export async function parseApiError(res: Response): Promise<ApiError> {
  const status = res.status;
  const code = codeFromStatus(status);

  let body: ProblemDetailsBody | undefined;
  try {
    body = await res.json();
  } catch {
    // No body, or body isn't valid JSON — fall through with body undefined.
    // This is expected for some 401/403/500 responses and must not throw.
  }

  const message = body?.detail ?? body?.title ?? res.statusText ?? "Request failed";
  const fields = code === "VALIDATION" ? body?.errors : undefined;

  return new ApiError(message, status, code, fields);
}