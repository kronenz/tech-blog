/**
 * Posts Repository
 * DB 포스트 CRUD 작업
 */

import { getDb } from './turso';
import type { DbPost, Post, CreatePostInput, UpdatePostInput } from './db-schema';
import { toPost } from './db-schema';

/**
 * UUID 생성
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * 모든 발행된 포스트 조회
 */
export async function getPublishedPosts(): Promise<Post[]> {
  const db = getDb();
  const result = await db.execute(`
    SELECT * FROM posts
    WHERE published = 1 AND is_deleted = 0
    ORDER BY published_at DESC
  `);

  return result.rows.map((row) => toPost(row as unknown as DbPost));
}

/**
 * slug로 포스트 조회
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM posts WHERE slug = ? AND is_deleted = 0',
    args: [slug],
  });

  if (result.rows.length === 0) return null;
  return toPost(result.rows[0] as unknown as DbPost);
}

/**
 * ID로 포스트 조회
 */
export async function getPostById(id: string): Promise<Post | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM posts WHERE id = ? AND is_deleted = 0',
    args: [id],
  });

  if (result.rows.length === 0) return null;
  return toPost(result.rows[0] as unknown as DbPost);
}

/**
 * 태그로 포스트 조회
 */
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const db = getDb();
  // JSON 배열에서 태그 검색 (SQLite JSON 함수 사용)
  const result = await db.execute({
    sql: `
      SELECT * FROM posts
      WHERE published = 1
        AND is_deleted = 0
        AND json_each.value = ?
      ORDER BY published_at DESC
    `,
    args: [tag],
  });

  // SQLite에서 JSON 검색이 복잡하므로 애플리케이션에서 필터링
  const allPosts = await getPublishedPosts();
  return allPosts.filter((post) =>
    post.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
  );
}

/**
 * 포스트 생성
 */
export async function createPost(input: CreatePostInput): Promise<Post> {
  const db = getDb();
  const id = generateId();
  const now = new Date().toISOString();
  const publishedAt = input.published ? now : null;

  await db.execute({
    sql: `
      INSERT INTO posts (id, slug, title, description, content, tags, published, published_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      input.slug,
      input.title,
      input.description || null,
      input.content,
      input.tags ? JSON.stringify(input.tags) : null,
      input.published ? 1 : 0,
      publishedAt,
      now,
      now,
    ],
  });

  const post = await getPostById(id);
  if (!post) throw new Error('Failed to create post');
  return post;
}

/**
 * 포스트 업데이트
 */
export async function updatePost(slug: string, input: UpdatePostInput): Promise<Post | null> {
  const db = getDb();
  const existing = await getPostBySlug(slug);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updates: string[] = ['updated_at = ?'];
  const args: (string | number | null)[] = [now];

  if (input.title !== undefined) {
    updates.push('title = ?');
    args.push(input.title);
  }
  if (input.description !== undefined) {
    updates.push('description = ?');
    args.push(input.description);
  }
  if (input.content !== undefined) {
    updates.push('content = ?');
    args.push(input.content);
  }
  if (input.tags !== undefined) {
    updates.push('tags = ?');
    args.push(JSON.stringify(input.tags));
  }
  if (input.published !== undefined) {
    updates.push('published = ?');
    args.push(input.published ? 1 : 0);

    // 처음 발행 시 published_at 설정
    if (input.published && !existing.publishedAt) {
      updates.push('published_at = ?');
      args.push(now);
    }
  }

  args.push(slug);

  await db.execute({
    sql: `UPDATE posts SET ${updates.join(', ')} WHERE slug = ?`,
    args,
  });

  return getPostBySlug(slug);
}

/**
 * 포스트 삭제 (soft delete)
 */
export async function deletePost(slug: string): Promise<boolean> {
  const db = getDb();
  const result = await db.execute({
    sql: 'UPDATE posts SET is_deleted = 1, updated_at = ? WHERE slug = ?',
    args: [new Date().toISOString(), slug],
  });

  return result.rowsAffected > 0;
}

/**
 * 포스트 발행/비발행 토글
 */
export async function togglePublish(slug: string): Promise<Post | null> {
  const existing = await getPostBySlug(slug);
  if (!existing) return null;

  return updatePost(slug, { published: !existing.published });
}

/**
 * 모든 고유 태그 조회
 */
export async function getAllTags(): Promise<string[]> {
  const posts = await getPublishedPosts();
  const tagSet = new Set<string>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => tagSet.add(tag.toLowerCase()));
  });

  return Array.from(tagSet).sort();
}

/**
 * slug 중복 체크
 */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT 1 FROM posts WHERE slug = ?',
    args: [slug],
  });

  return result.rows.length === 0;
}
