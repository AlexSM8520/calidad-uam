/**
 * Helper functions to normalize IDs between frontend (id) and backend (_id)
 */

export function normalizeId<T extends { id?: string; _id?: string }>(item: T): T & { id: string } {
  if (!item) return item as T & { id: string };
  const id = item._id || item.id || '';
  return { ...item, id, _id: id };
}

export function normalizeArray<T extends { id?: string; _id?: string }>(items: T[]): (T & { id: string })[] {
  return items.map(normalizeId);
}

export function extractId(item: { id?: string; _id?: string } | string | null | undefined): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return item._id || item.id || '';
}

export function extractIdFromObject(item: { _id?: string; id?: string } | string | null | undefined): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item !== null) {
    return (item as any)._id || (item as any).id || '';
  }
  return '';
}

