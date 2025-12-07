/**
 * Turso Database Client
 * libSQL 기반 Edge-ready 데이터베이스 클라이언트
 */

import { createClient, type Client } from '@libsql/client';

let client: Client | null = null;

/**
 * Turso 클라이언트 인스턴스 가져오기 (싱글톤)
 */
export function getTursoClient(): Client {
  if (client) return client;

  const url = import.meta.env.TURSO_DATABASE_URL;
  const authToken = import.meta.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not set');
  }

  client = createClient({
    url,
    authToken,
  });

  return client;
}

/**
 * 개발 환경용 로컬 SQLite 클라이언트
 */
export function getLocalClient(): Client {
  if (client) return client;

  client = createClient({
    url: 'file:local.db',
  });

  return client;
}

/**
 * 환경에 따라 적절한 클라이언트 반환
 */
export function getDb(): Client {
  const isDev = import.meta.env.DEV;
  const hasTursoUrl = !!import.meta.env.TURSO_DATABASE_URL;

  // 프로덕션 또는 Turso URL이 있으면 Turso 사용
  if (!isDev || hasTursoUrl) {
    return getTursoClient();
  }

  // 개발 환경에서 Turso URL 없으면 로컬 SQLite
  return getLocalClient();
}

/**
 * DB 연결 테스트
 */
export async function testConnection(): Promise<boolean> {
  try {
    const db = getDb();
    await db.execute('SELECT 1');
    return true;
  } catch (error) {
    console.error('DB connection failed:', error);
    return false;
  }
}
