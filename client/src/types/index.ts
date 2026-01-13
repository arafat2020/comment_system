export interface User {
    _id: string;
    id?: string;
    username: string;
    email?: string;
    avatarUrl?: string;
}

export interface Post {
    _id: string;
    content: string;
    imageUrl?: string;
    author: User;
    likes: Array<{ _id: string; username: string } | string>;
    dislikes: Array<{ _id: string; username: string } | string>;
    createdAt: string;
    isOptimistic?: boolean;
}

export interface Comment {
    _id: string;
    content: string;
    author: User;
    postId: string;
    parentComment?: string;
    likes: Array<{ _id: string; username: string } | string>;
    dislikes: Array<{ _id: string; username: string } | string>;
    replies?: Comment[];
    createdAt: string;
    isOptimistic?: boolean;
}

export type OptimisticAction =
    | { type: 'add'; payload: Post | Comment }
    | { type: 'like' | 'dislike'; payload: { postId?: string; commentId?: string; userId: string; username: string } }
    | { type: 'delete'; payload: { id: string } }
    | { type: 'edit'; payload: { id: string; content: string } }
    | { type: 'update'; payload: Partial<Post> | Partial<Comment> };
