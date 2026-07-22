import Dexie from 'dexie';
import type { PostDTO } from '../remote/dtos/post-dto';
import { PostDAO } from './daos/post-dao';

/**
 * AppDatabase — the local persistence layer, backed by IndexedDB via Dexie.
 * Mirrors the Flutter guide's `AppDatabase` (abstract contract) +
 * `AppDatabaseImpl` (the concrete connection that owns DAOs and delegates to
 * them). This file is the connection/schema provider; per-table queries live in
 * `daos/*` (see `PostDAO`), matching how the remote layer separates
 * `http-client` from `*-remote-data-source`.
 *
 * Dexie stores plain JSON-shaped objects directly, so PostDTO is both the
 * in-memory and on-disk shape.
 */
export abstract class AppDatabase {
  abstract insertPosts(posts: PostDTO[]): Promise<void>;
  abstract getPosts(): Promise<PostDTO[]>;
}

export class AppDatabaseImpl extends Dexie implements AppDatabase {
  private readonly postDAO: PostDAO;

  constructor() {
    super('app_database');
    this.version(1).stores({
      // `id` is the natural primary key (not auto-incremented).
      posts: 'id, title',
    });
    const posts = this.table<PostDTO, number>('posts');
    this.postDAO = new PostDAO(posts);
  }

  async insertPosts(posts: PostDTO[]): Promise<void> {
    await this.postDAO.insertAll(posts);
  }

  async getPosts(): Promise<PostDTO[]> {
    return this.postDAO.getAll();
  }

  async clearPosts(): Promise<void> {
    await this.postDAO.clear();
  }
}
