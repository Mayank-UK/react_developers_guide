import type { AxiosInstance } from 'axios';
import { guardedApiCall } from '../../core/error-handling/guards';
import { ServerException } from '../../core/error-handling/exceptions';
import {
  postDtoFromJson,
  type PostDTO,
} from './dtos/post-dto';

/**
 * PostRemoteDataSource — talks to the REST API and returns DTOs. Mirrors the
 * Flutter `PostRemoteDataSource`. Raw engine errors are upgraded to typed
 * AppExceptions by `guardedApiCall`; non-2xx responses are rejected by axios
 * and likewise upgraded to a `ServerException` by the guards pipeline.
 */
export interface PostRemoteDataSource {
  getPosts(): Promise<PostDTO[]>;
}

export class JsonPlaceholderPostRemoteDataSource implements PostRemoteDataSource {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  getPosts(): Promise<PostDTO[]> {
    return guardedApiCall(async () => {
      const response = await this.http.get<unknown>('/posts');

      if (!Array.isArray(response.data)) {
        throw new ServerException('Expected a list of posts');
      }

      return response.data.map((item) =>
        postDtoFromJson(item as Record<string, unknown>),
      );
    });
  }
}
