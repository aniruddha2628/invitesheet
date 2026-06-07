import { Model } from 'mongoose';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Generic ownership assertion.
 * Fetches a resource by _id and verifies it belongs to the given userId.
 * Returns 404 (never 403) if not found or not owned — prevents IDOR enumeration.
 */
export async function assertOwnership(
  model: Model<any>,
  resourceId: string,
  userId: string,
  resourceName: string = 'Resource'
): Promise<any> {
  const query: Record<string, any> = { _id: resourceId, userId };

  // Check if the model has an isDeleted field
  if (model.schema.paths['isDeleted']) {
    query.isDeleted = false;
  }

  const resource = await model.findOne(query);

  if (!resource) {
    throw new AppError(404, 'NOT_FOUND', `${resourceName} not found.`);
  }

  return resource;
}

/**
 * Assert ownership on event by userId. Convenience wrapper.
 */
export async function assertEventOwnership(
  model: Model<any>,
  eventId: string,
  userId: string
): Promise<any> {
  return assertOwnership(model, eventId, userId, 'Event');
}
