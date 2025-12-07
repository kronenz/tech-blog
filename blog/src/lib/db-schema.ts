/**
 * Database Schema and Migration
 * Turso/SQLite 스키마 정의 및 마이그레이션
 */

import { getDb } from './turso';

/**
 * posts 테이블 생성 SQL
 */
const CREATE_POSTS_TABLE = `
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  tags TEXT,
  published INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  published_at TEXT
)
`;

/**
 * 인덱스 생성 SQL
 */
const CREATE_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)',
  'CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published, is_deleted)',
  'CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC)',
];

/**
 * 데이터베이스 마이그레이션 실행
 */
export async function runMigrations(): Promise<void> {
  const db = getDb();

  console.log('Running database migrations...');

  // posts 테이블 생성
  await db.execute(CREATE_POSTS_TABLE);
  console.log('- Created posts table');

  // 인덱스 생성
  for (const indexSql of CREATE_INDEXES) {
    await db.execute(indexSql);
  }
  console.log('- Created indexes');

  console.log('Migrations complete!');
}

/**
 * Post 타입 정의
 */
export interface DbPost {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  tags: string | null; // JSON string
  published: number; // SQLite boolean (0 or 1)
  is_deleted: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/**
 * Post 입력 타입
 */
export interface CreatePostInput {
  slug: string;
  title: string;
  description?: string;
  content: string;
  tags?: string[];
  published?: boolean;
}

/**
 * Post 업데이트 타입
 */
export interface UpdatePostInput {
  title?: string;
  description?: string;
  content?: string;
  tags?: string[];
  published?: boolean;
}

/**
 * 정규화된 Post 타입 (애플리케이션용)
 */
export interface Post {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  tags: string[];
  published: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

/**
 * DB Row를 Post 객체로 변환
 */
export function toPost(row: DbPost): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    content: row.content,
    tags: row.tags ? JSON.parse(row.tags) : [],
    published: row.published === 1,
    isDeleted: row.is_deleted === 1,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    publishedAt: row.published_at ? new Date(row.published_at) : null,
  };
}
