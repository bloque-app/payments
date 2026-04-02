export class BloqueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BloqueError';
    Object.setPrototypeOf(this, BloqueError.prototype);
  }
}

export class APIError extends BloqueError {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string, code?: string) {
    super(message, 401, code);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class RateLimitError extends APIError {
  constructor(message: string, code?: string) {
    super(message, 429, code);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class ValidationError extends BloqueError {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class KeyRevokedError extends BloqueError {
  constructor(
    message: string,
    public keyId?: string,
  ) {
    super(message);
    this.name = 'KeyRevokedError';
    Object.setPrototypeOf(this, KeyRevokedError.prototype);
  }
}
