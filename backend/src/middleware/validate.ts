import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Generic Zod validation middleware.
 * Validates req.body, req.params, and/or req.query against provided schemas.
 */
export function validate(schemas: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, string[]> = {};

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        mergeErrors(errors, result.error);
      } else {
        req.body = result.data;
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        mergeErrors(errors, result.error);
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        mergeErrors(errors, result.error);
      } else {
        req.query = result.data;
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed.',
          fields: errors,
        },
      });
      return;
    }

    next();
  };
}

function mergeErrors(target: Record<string, string[]>, zodError: ZodError): void {
  for (const issue of zodError.issues) {
    const path = issue.path.join('.') || '_root';
    if (!target[path]) {
      target[path] = [];
    }
    target[path].push(issue.message);
  }
}
