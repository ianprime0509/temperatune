/** A generic error used in the application to create an alert box. */
export default class AppError extends Error {
  message: string;
  details?: string;

  constructor(message: string, details?: string) {
    super(message);
    this.message = message;
    this.details = details;
  }
}
