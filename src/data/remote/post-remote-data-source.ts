import type { AxiosInstance } from 'axios';
import {
  guardedApiCall,
  responseToException,
} from '../../core/error-handling/guards';
import { ServerException } from '../../core/error-handling/exceptions';
import {
  postDtoFromJson,
  type PostDTO,
} from './dtos/post-dto';

/**
 * PostRemoteDataSource — talks to the REST API and returns DTOs. Mirrors the
 * Flutter `PostRemoteDataSource`. Raw engine errors are upgraded to typed
 * AppExceptions by `guardedApiCall`; non-2xx responses are turned into a
 * `ServerException`.
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

      if (response.status < 200 || response.status >= 300) {
        throw responseToException(response);
      }

      if (!Array.isArray(response.data)) {
        throw new ServerException('Expected a list of posts');
      }

      return response.data.map((item) =>
        postDtoFromJson(item as Record<string, unknown>),
      );
    });
  }
}
