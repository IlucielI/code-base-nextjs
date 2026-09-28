/**
 * Generic Base Repository Contract.
 * Standardizes CRUD operations across database, cache, or external API datasources.
 * 
 * @template T - The domain entity model
 * @template ID - The identifier type (defaults to string)
 * @template TQuery - Optional query/filter options (defaults to unknown)
 */
export interface IBaseRepository<T, ID = string, TQuery = unknown> {
  findById(id: ID): Promise<T | null>;
  findAll(query?: TQuery): Promise<{ items: T[]; total: number }>;
  create(item: Omit<T, 'id'> | Partial<T>): Promise<T>;
  update(id: ID, item: Partial<T>): Promise<T>;
  delete(id: ID): Promise<boolean>;
}
