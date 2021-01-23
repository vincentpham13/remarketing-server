// @ts-nocheck
type Debug = {
  message: string;
  error: any;
};

interface HttpError extends Error {
  statusCode: number;
}

interface DebugError extends HttpError {
  debug: Debug;
  addDebug(debug: Debug);
  addDebugMessage(debugMessage: string);
  addDebugError(debugError: Error);
}

interface ResponseError extends HttpError {
  detail: string;
  addResponse(responseMessage: string);
}

export class HttpErrorBase implements DebugError, ResponseError {
  type: string | null = null;
  statusCode: number;
  title: string = "";
  detail: string = "";
  debug: Debug = { message: "", error: null };
  name: string;
  message: string;
  stack?: string;

  constructor(error: any, message?: string) {
    if (error instanceof Error) {
      this.debug.message = error.message;
      this.debug.error = error.stack;
      this.detail = message || error.message;
    } else if (error instanceof HttpErrorBase) {
      this.statusCode = error.statusCode;
      this.debug = error.debug;
      this.detail = error.detail || message;
      this.type = error.type || message;
      this.title = error.title || message;
    } else if (error === null) {
      this.detail = message;
      this.title = message;
    }

    // Check Joi error instance, since joi error is also child of Error class
    if (error && error.isJoi) {
      if (!message) {
        const pattern = /[^[\]]+(?=])/;
        const messageArr = error.message.match(pattern);
        this.detail = messageArr
          ? messageArr[0].replace(/\"/g, "")
          : error.message;
      }
    }
  }

  addDebug(debug: Debug): void {
    this.debug = debug;
  }

  addDebugMessage(debugMessage: string): void {
    this.debug.message = debugMessage;
  }

  addDebugError(debugError: Error): void {
    this.debug.error = debugError;
  }

  addResponse(detail: string): void {
    this.detail = detail;
  }
}

const INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR";
const UNAUTHORIZED = "UNAUTHORIZED";
const FORBIDDEN = "FORBIDDEN";
const BAD_REQUEST = "BAD_REQUEST";
const EMAIL_ALREADY_EXIST = "EMAIL_ALREADY_EXIST";
const PHONE_ALREADY_EXIST = "PHONE_ALREADY_EXIST";
const INVALID_PHONE_NUMBER = "INVALID_PHONE_NUMBER";
const REQUESTED_SOURCE_NOT_FOUND = "REQUESTED_SOURCE_NOT_FOUND";
const INVALID_TOKEN = "INVALID_TOKEN";
const RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND";
const SIGNUP_METHOD_NOT_ALLOWED = "SIGNUP_METHOD_NOT_ALLOWED";
const RESOURCE_CONFLICT = "RESOURCE_CONFLICT";
const UNAVAILABLE_RESOURCE = "UNAVAILABLE_RESOURCE";

export class InternalServerError extends HttpErrorBase {
  statusCode = 500;
  type = INTERNAL_SERVER_ERROR;

  constructor(error: any, message?: string) {
    super(error, message);
    if (error instanceof HttpErrorBase && error.type != INTERNAL_SERVER_ERROR) {
      this.statusCode = error.statusCode;
      this.type = error.type;
      this.debug = error.debug;
      this.detail = error.detail;
    }
  }
}

export class Unauthorized extends HttpErrorBase {
  statusCode = 401;
  type = UNAUTHORIZED;

  constructor(error: any, message: string) {
    super(error, message);
  }
}

export class Forbidden extends HttpErrorBase {
  statusCode = 403;
  type = FORBIDDEN;

  constructor(error: any, message: string) {
    super(error, message);
  }
}

export class EmailAlreadyExist extends HttpErrorBase {
  statusCode = 409;
  type = EMAIL_ALREADY_EXIST;

  constructor(error: any, message: string) {
    super(error, message);
  }
}

export class PhoneAlreadyExist extends HttpErrorBase {
  statusCode = 409;
  type = PHONE_ALREADY_EXIST;

  constructor(error: any, message: string) {
    super(error, message);
  }
}

export class RequestSourceNotFound extends HttpErrorBase {
  statusCode = 404;
  type = REQUESTED_SOURCE_NOT_FOUND;

  constructor(error: any, message: string) {
    super(error, message);
  }
}

export class InvalidToken extends HttpErrorBase {
  statusCode = 404;
  type = INVALID_TOKEN;

  constructor(error: any, message: string) {
    super(error, message);
  }
}

export class InvalidPhoneNumber extends HttpErrorBase {
  statusCode = 409;
  type = INVALID_PHONE_NUMBER;

  constructor(error: any, message?: string) {
    super(error, message);
  }
}

export class ResourceNotFound extends HttpErrorBase {
  statusCode = 404;
  type = RESOURCE_NOT_FOUND;

  constructor(error: any, title: string, message: string) {
    super(error, message);
    this.title = title;
    this.detail = message;
  }
}

export class SignupMethodNotAllowed extends HttpErrorBase {
  statusCode = 403;
  type = SIGNUP_METHOD_NOT_ALLOWED;

  constructor(error: any, message: string) {
    super(error, message);
  }
}

export class BadRequest extends HttpErrorBase {
  statusCode = 400;
  type = BAD_REQUEST;

  constructor(error: any, message?: string) {
    super(error, message);
  }
}

export class ResourceConflict extends HttpErrorBase {
  statusCode = 409;
  type = RESOURCE_CONFLICT;

  constructor(error: any, message?: string) {
    super(error, message);
  }
}

export class UnavailableResource extends HttpErrorBase {
  statusCode = 451;
  type = UNAVAILABLE_RESOURCE;

  constructor(error: any, message?: string) {
    super(error, message);
  }
}
