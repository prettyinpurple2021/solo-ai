export interface Author {
    id: string;
    name: string | null;
    image: string | null;
    level?: number | null;
}

export interface Topic {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
}

export interface PostProps {
    id: string;
    title: string;
    content: string;
    created_at: Date;
    author: Author;
    topic?: Topic | null; // Allow null to match Drizzle query result
    _count?: {
        likes: number; // For compatibility if passed from raw query
        comments: number;
    };
    like_count?: number | null;
    comment_count?: number | null;
    isLiked?: boolean;
}

export interface CommentProps {
    id: string;
    content: string;
    created_at: Date;
    author: Author;
    parent_id?: string | null;
    like_count?: number | null;
    is_solution?: boolean | null;
}
