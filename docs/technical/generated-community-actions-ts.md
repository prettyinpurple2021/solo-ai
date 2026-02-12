---
title: community-actions.ts
source: src\lib\actions\community-actions.ts
generated: 2026-02-12T00:41:05.970Z
---

```markdown
# Community Actions Module

## Overview

This module facilitates various community interactions within a platform, enabling users to manage posts, comments, and likes. It handles the creation, retrieval, and interaction of community posts and comments, streamlining the user engagement process.

## Key Components

### Schemas

- **`createPostSchema`**: Validates data for creating posts. It ensures that the `title` is between 3 to 255 characters and the `content` is at least 10 characters long. The `topicId` must be a valid string or UUID.
  
- **`createCommentSchema`**: Validates data for creating comments. Requires a `postId` string and ensures `content` is at least 1 character. Supports an optional `parentId`.

### Functions

- **`getTopics()`**: Retrieves all active community topics, ordered by a predefined field. 

- **`getPosts(topicId?: string)`**: Retrieves posts related to a specific topic. If no topic is provided, it fetches general community posts using `getCommunityFeed`.

- **`getCommunityFeed(topicId?: string)`**: Retrieves community posts, including the like status of posts for logged-in users.

- **`createPost(data: z.infer<typeof createPostSchema>)`**: Authenticates the user and parses the post creation data. Inserts the new post into the database and awards experience points (XP) to the user.

- **`addComment(data: z.infer<typeof createCommentSchema>)`**: Authenticates the user, validates the comment data, ensures related post existence, inserts the comment, updates post comment count, and awards XP to the user.

- **`toggleLike(entityType: 'post' | 'comment', entityId: string)`**: Toggles the like status on posts or comments for an authenticated user, updating the like count accordingly.

## Usage Example

```typescript
import { createPost, addComment, getTopics } from '/path/to/community-actions';

// Create a new post
await createPost({
  title: "Welcome to Our Community!",
  content: "This is the content of the post.",
  topicId: "topic-uuid",
});

// Add a comment to a post
await addComment({
  postId: "post-uuid",
  content: "This is a comment on the post.",
});

// Get all topics
const topics = await getTopics();
console.log(topics);
```

## Dependencies

### External

- **`drizzle-orm`**: Provides query building and ORM capabilities for database interactions.
- **`zod`**: Handles schema validation and parsing of input data.

### Internal

- **`@/db`**: Defines database connection and schema for community elements.
- **`@/lib/auth-server`**: Provides methods for user authentication.
- **`@/lib/wellness`**: Manages user experience points and rewards.
- **`next/cache`**: Utilized for server-side route revalidation.
```
