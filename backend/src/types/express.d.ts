/* eslint-disable @typescript-eslint/no-namespace */

declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      email: string;
      role: string;
    };
  }
}
