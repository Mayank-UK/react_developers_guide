/**
 * Post — a pure domain model. It knows nothing about JSON, HTTP, or IndexedDB.
 * Consumed by use cases, the store, and the UI. Mirrors the Flutter `Post`.
 */
export interface Post {
  id: number;
  title: string;
  body: string;
}
