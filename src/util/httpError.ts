interface CustomErrorProps {
  status: number;
  message: string;
}

class HttpError extends Error {
  status: number;

  constructor(data: CustomErrorProps) {
    const { message, status } = data;

    super(message);

    this.status = status;
  }
}

class BadRequestError extends HttpError {
  constructor(message = "Bad Request.") {
    super({ status: 400, message });
  }
}

class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized.") {
    super({ status: 401, message });
  }
}

class NotFoundError extends HttpError {
  constructor(message = "Not Found.") {
    super({ status: 404, message });
  }
}

class MethodNotAllowedError extends HttpError {
  constructor(message = "Method Not Allowed.") {
    super({ status: 405, message });
  }
}

class ConflictError extends HttpError {
  constructor(message = "Conflict.") {
    super({ status: 409, message });
  }
}

class UnsupportedMediaTypeError extends HttpError {
  constructor(message = "Unsupported Media Type.") {
    super({ status: 415, message });
  }
}

class InternalServerError extends HttpError {
  constructor(message = "Internal Server Error") {
    super({ status: 500, message });
  }
}

export {
  HttpError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  MethodNotAllowedError,
  ConflictError,
  UnsupportedMediaTypeError,
  InternalServerError,
};
