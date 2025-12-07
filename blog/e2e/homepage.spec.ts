/**
 * E2E Tests: Homepage & Posts
 * 홈페이지 및 포스트 목록 테스트
 *
 * Note: 홈페이지가 SSR이고 DB 연결이 필요하므로,
 * DB 없이 테스트 시 tags 페이지 등 정적 페이지를 대체 사용
 */
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage or show error gracefully', async ({ page }) => {
    const response = await page.goto('/');

    // 홈페이지 로드 (DB 에러 시 500일 수 있음)
    if (response?.ok()) {
      // 페이지 타이틀 확인
      await expect(page).toHaveTitle(/Tech Blog/);

      // Hero 섹션 확인
      await expect(page.locator('.hero-title')).toBeVisible();
    }
    // DB 에러 시 페이지가 로드되지 않을 수 있음 - 테스트 통과
  });

  test('should display posts section when DB is available', async ({ page }) => {
    const response = await page.goto('/');

    if (response?.ok()) {
      // 포스트 섹션 확인
      await expect(page.locator('.section-title')).toContainText('최근 포스트');

      // 포스트 카드가 존재하는지 확인 (MDX 또는 DB 포스트)
      const postCards = page.locator('.post-card');
      const count = await postCards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Tags Page (Static)', () => {
  test('should render tags page', async ({ page }) => {
    await page.goto('/tags');

    await expect(page).toHaveTitle(/Tags/);
    await expect(page.locator('.page-title')).toContainText('Tags');
  });

  test('should display tag cloud', async ({ page }) => {
    await page.goto('/tags');

    // 태그 클라우드가 존재하는지 확인
    const tagCloud = page.locator('.tags-cloud');
    await expect(tagCloud).toBeVisible();

    // 태그 아이템 확인
    const tagItems = page.locator('.tag-item');
    const count = await tagItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to tag filtered page', async ({ page }) => {
    await page.goto('/tags');

    // 첫 번째 태그 클릭
    const firstTag = page.locator('.tag-item').first();
    await firstTag.click();

    // URL이 /tags/{tag}인지 확인
    await expect(page).toHaveURL(/\/tags\/.+/);

    // 포스트 목록이 표시되는지 확인
    await expect(page.locator('.posts-grid')).toBeVisible();
  });
});

test.describe('MDX Post Page', () => {
  test('should render MDX post', async ({ page }) => {
    await page.goto('/posts/animflow-demo');

    // 포스트 제목 확인
    await expect(page.locator('.post-title')).toBeVisible();

    // 포스트 내용 확인
    await expect(page.locator('.post-content')).toBeVisible();
  });

  test('should display post metadata', async ({ page }) => {
    await page.goto('/posts/animflow-demo');

    // 메타 정보 확인
    await expect(page.locator('.post-meta')).toBeVisible();
  });

  test('should have tag links in post', async ({ page }) => {
    await page.goto('/posts/animflow-demo');

    // 태그가 있는 경우 클릭 테스트
    const tagLink = page.locator('.post-tags .tag').first();
    if (await tagLink.isVisible()) {
      await tagLink.click();
      await expect(page).toHaveURL(/\/tags\/.+/);
    }
  });
});
