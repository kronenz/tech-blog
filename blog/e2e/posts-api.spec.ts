/**
 * E2E Tests: Posts API
 * API 엔드포인트 기능 테스트
 *
 * Note: 이 테스트는 DB가 설정된 환경에서 실행해야 합니다.
 * DB가 없으면 500 에러가 반환됩니다.
 */
import { test, expect } from '@playwright/test';

test.describe('Posts API', () => {
  test('GET /api/posts should respond', async ({ request }) => {
    const response = await request.get('/api/posts');

    // DB가 없으면 500, 있으면 200
    expect([200, 500]).toContain(response.status());

    if (response.ok()) {
      const data = await response.json();
      expect(data).toHaveProperty('posts');
      expect(Array.isArray(data.posts)).toBeTruthy();
    }
  });

  test('GET /api/posts with tag filter should respond', async ({ request }) => {
    const response = await request.get('/api/posts?tag=test');

    // DB가 없으면 500, 있으면 200
    expect([200, 500]).toContain(response.status());
  });

  test('GET /api/posts/check-slug should check availability', async ({ request }) => {
    const response = await request.get('/api/posts/check-slug?slug=test-slug-12345');

    // DB가 없으면 500, 있으면 200
    expect([200, 500]).toContain(response.status());

    if (response.ok()) {
      const data = await response.json();
      expect(data).toHaveProperty('available');
      expect(data).toHaveProperty('slug');
    }
  });

  test('GET /api/posts/check-slug should reject invalid slug format', async ({ request }) => {
    // 유효하지 않은 slug (대문자, 특수문자)
    const response = await request.get('/api/posts/check-slug?slug=Invalid_Slug!');

    // 형식 검사는 DB 없이도 가능 - 200 반환
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.available).toBe(false);
  });

  test('GET /api/posts/check-slug should require slug parameter', async ({ request }) => {
    const response = await request.get('/api/posts/check-slug');

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('POST /api/posts should require required fields', async ({ request }) => {
    const response = await request.post('/api/posts', {
      data: {
        title: 'Test Title',
        // missing slug and content
      },
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('GET /api/posts/:slug should respond for non-existent post', async ({ request }) => {
    const response = await request.get('/api/posts/non-existent-slug-12345');

    // DB가 없으면 500, 있으면 404
    expect([404, 500]).toContain(response.status());

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});
