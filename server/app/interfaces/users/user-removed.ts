import { User } from './user';

export interface UserRemoved {
    user: User;
    reason: string;
}
