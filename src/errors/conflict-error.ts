export class ConflictError extends Error {
  statusCode: number;

  constructor(message: string) {
    super();
    this.statusCode = 409;
    this.message = message;
  }
}
