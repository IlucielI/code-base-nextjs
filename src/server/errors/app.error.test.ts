import { describe, it, expect } from 'vitest';
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
} from './app.error';

describe('AppError Hierarchy', () => {
  it('should instantiate AppError with default parameters', () => {
    const error = new AppError('Custom error');
    expect(error.message).toBe('Custom error');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(error.isOperational).toBe(true);
    expect(error.name).toBe('AppError');
  });

  it('should create BadRequestError with 400 status', () => {
    const error = new BadRequestError('Invalid payload', { field: 'email' });
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
    expect(error.isOperational).toBe(true);
    expect(error.details).toEqual({ field: 'email' });
  });

  it('should create UnauthorizedError with 401 status', () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('should create ForbiddenError with 403 status', () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });

  it('should create NotFoundError with 404 status', () => {
    const error = new NotFoundError('Item not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });

  it('should create ConflictError with 409 status', () => {
    const error = new ConflictError();
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('CONFLICT');
  });

  it('should create InternalServerError as non-operational error', () => {
    const error = new InternalServerError();
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(error.isOperational).toBe(false);
  });
});
