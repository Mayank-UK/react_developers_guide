import type { Post } from '../../../domain/models/post';

/**
 * PostDTO — the wire/transport shape of a post, as returned by the REST API and
 * stored in the local cache. Responsible for (de)serialization and for mapping
 * to/from the domain `Post`. Mirrors the Flutter `PostDTO`.
 *
 * In TypeScript this is a plain interface plus pure conversion helpers; there is
 * no runtime class needed (unlike Dart) because types are erased at runtime.
 */
export interface PostDTO {
  id: number;
  title: string;
  body: string;
}

/** Deserialize a JSON object (from the API or IndexedDB) into a PostDTO. */
export function postDtoFromJson(json: Record<string, unknown>): PostDTO {
  return {
    id: Number(json.id),
    title: String(json.title ?? ''),
    body: String(json.body ?? ''),
  };
}

/** Serialize a PostDTO to a plain JSON object (for IndexedDB persistence). */
export function postDtoToJson(dto: PostDTO): Record<string, unknown> {
  return { id: dto.id, title: dto.title, body: dto.body };
}

/** Convert a transport DTO into a domain model. */
export function toPost(dto: PostDTO): Post {
  return { id: dto.id, title: dto.title, body: dto.body };
}

/** Convert a domain model into a transport DTO. */
export function fromPost(post: Post): PostDTO {
  return { id: post.id, title: post.title, body: post.body };
}
