/**
 * Database Migration API (Development Only)
 * POST /api/db/migrate - 데이터베이스 마이그레이션 실행
 *
 * ⚠️ 주의: 이 엔드포인트는 개발/관리 목적으로만 사용해야 합니다.
 * 프로덕션에서는 적절한 인증 처리가 필요합니다.
 */
import type { APIRoute } from 'astro';
import { runMigrations } from '../../../lib/db-schema';

export const POST: APIRoute = async ({ request }) => {
  try {
    // 개발 환경 또는 특수 헤더 확인
    const authHeader = request.headers.get('X-Migration-Key');
    const expectedKey = import.meta.env.MIGRATION_SECRET_KEY;

    // 프로덕션에서는 시크릿 키 필요
    if (import.meta.env.PROD && authHeader !== expectedKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 마이그레이션 실행
    await runMigrations();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database migration completed successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Migration failed:', error);
    return new Response(
      JSON.stringify({
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
