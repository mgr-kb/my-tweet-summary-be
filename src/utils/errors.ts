import type { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export class AppError<T = unknown> extends Error {
  public statusCode: ContentfulStatusCode;
  public data?: T;

  constructor(
    message: string,
    statusCode: ContentfulStatusCode = 500,
    data?: T,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.data = data;
  }
}

export class ValidationError<T = unknown> extends AppError {
  constructor(message: string, data?: T) {
    super(message, 400, data);
  }
}

export class AuthenticationError<T = unknown> extends AppError {
  constructor(message: string, data?: T) {
    super(message, 401, data);
  }
}

export class ForbiddenError<T = unknown> extends AppError {
  constructor(message: string, data?: T) {
    super(message, 403, data);
  }
}

export class NotFoundError<T = unknown> extends AppError {
  constructor(message: string, data?: T) {
    super(message, 404, data);
  }
}

export function createErrorFromHTTPException(e: HTTPException): AppError {
  const status = e.status || 500;
  const message = e.message || "Unknown error occurred";

  return new AppError(message, status);
}
