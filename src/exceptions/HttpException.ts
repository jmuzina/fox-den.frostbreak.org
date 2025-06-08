export class HttpException extends Error {
  /**
   * Creates an instance of HttpException.
   *
   * @param status The HTTP status code (e.g., 400, 401, 404, 500).
   * @param message A creature-readable error message.
   * @param errors An array of Error objects providing more details about the error.
   */
  constructor(
    public status: number,
    public message: string,
    public data?: { errors?: Error[]; extra?: any },
  ) {
    super(message);
    Object.setPrototypeOf(this, HttpException.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpException);
    }
  }
}
