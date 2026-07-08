import type { User } from './user';

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
}
