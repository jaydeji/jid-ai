import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

/**
 * Business Logic Error Class
 *
 * * For both HTTP and non-HTTP related errors e.g. background jobs.
 * * If you need to attach more custom properties to your errors that aren't covered by HTTPException.
 */
export class AppError extends Error {
  status: number;
  isOperational: boolean;

  constructor(message: string, status: number, isOperational = true) {
    super(message);
    this.status = status;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

type StatusType = NonNullable<ConstructorParameters<typeof HTTPException>[0]>;

const statusMessages: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  503: 'Service Unavailable',
};

const getMessage = ({
  status,
  message,
}: {
  status: StatusType;
  message: String;
}) => {
  let headers;
  if (status === 401)
    headers = {
      'Content-Type': 'application/json',
      'WWW-Authenticate': 'Bearer error="invalid_token"',
    };

  return { message: message || statusMessages[status], status, headers };
};

export const errorHandler = (error: Error, c: Context) => {
  //   console.error(error);
  console.log(c.req.path);

  if (error instanceof AppError) {
    const status = error.status as StatusType;

    const msg = getMessage({
      status,
      message: error.message,
    });

    return c.json({ message: msg.message }, msg.status);
  }

  if (error instanceof HTTPException) {
    // this comes directly from auth middleware
    return c.json({ message: error.message }, error.getResponse());
  }

  // For unhandled errors
  // logging error.message important! here
  return c.json({ message: 'Internal Server Error' }, 500);
};
