/**
 * E2E Tests: Publish Flow
 * 에디터에서 포스트 발행까지의 전체 플로우 테스트
 */
import { test, expect } from '@playwright/test';

test.describe('Publish Flow', () => {
  test('should validate required fields in publish modal', async ({ page }) => {
    await page.goto('/editor');

    // Publish 모달 열기
    await page.getByRole('button', { name: 'Publish' }).click();
    await expect(page.locator('.modal-overlay')).toBeVisible();

    // 빈 상태에서 발행 시도
    const publishBtn = page.getByRole('button', { name: '발행하기' });
    await expect(publishBtn).toBeDisabled();
  });

  test('should validate slug format', async ({ page }) => {
    await page.goto('/editor');

    // Publish 모달 열기
    await page.getByRole('button', { name: 'Publish' }).click();

    // 제목 입력
    await page.locator('input[placeholder*="제목"]').fill('Test Post Title');

    // slug 필드 찾기 및 입력
    const slugInput = page.locator('input[placeholder*="slug"]');
    await slugInput.clear();
    await slugInput.fill('valid-slug');

    // 잠시 대기 (debounce)
    await page.waitForTimeout(600);

    // 유효한 slug면 "사용 가능" 표시
    const availableText = page.locator('text=사용 가능');
    await expect(availableText).toBeVisible({ timeout: 5000 });
  });

  test('should auto-generate slug from title', async ({ page }) => {
    await page.goto('/editor');

    // Publish 모달 열기
    await page.getByRole('button', { name: 'Publish' }).click();

    // slug 필드 비우기
    const slugInput = page.locator('input[placeholder*="slug"]');
    await slugInput.clear();

    // 제목 입력
    await page.locator('input[placeholder*="제목"]').fill('My Test Post');

    // slug가 자동 생성되었는지 확인
    await expect(slugInput).toHaveValue(/my-test-post|test-post/i);
  });

  test('should add and remove tags', async ({ page }) => {
    await page.goto('/editor');

    // Publish 모달 열기
    await page.getByRole('button', { name: 'Publish' }).click();

    // 태그 입력
    const tagInput = page.locator('input[placeholder*="태그"]');
    await tagInput.fill('testtag');
    await tagInput.press('Enter');

    // 태그가 추가되었는지 확인
    await expect(page.locator('.tag').filter({ hasText: 'testtag' })).toBeVisible();

    // 태그 제거
    const removeBtn = page.locator('.tag-remove').first();
    await removeBtn.click();

    // 태그가 제거되었는지 확인
    await expect(page.locator('.tag').filter({ hasText: 'testtag' })).not.toBeVisible();
  });

  test('should show content warning when empty', async ({ page }) => {
    await page.goto('/editor');

    // 에디터 내용이 비어있는 상태
    // Publish 모달 열기
    await page.getByRole('button', { name: 'Publish' }).click();

    // 필수 필드 입력
    await page.locator('input[placeholder*="제목"]').fill('Test Title');
    await page.locator('input[placeholder*="slug"]').fill('test-slug-empty');

    // 잠시 대기
    await page.waitForTimeout(600);

    // 발행 버튼 상태 확인 (내용이 비어있으면 발행 가능 상태여도 에러 발생)
    const publishBtn = page.getByRole('button', { name: '발행하기' });

    // 발행 시도
    if (await publishBtn.isEnabled()) {
      await publishBtn.click();

      // 에러 메시지 확인
      await expect(page.locator('text=내용이 비어있습니다')).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe('Editor Content', () => {
  test('should type content in editor', async ({ page }) => {
    await page.goto('/editor');

    // CodeMirror 에디터에 텍스트 입력
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type('# Hello World\n\nThis is a test post.');

    // 내용이 입력되었는지 확인
    await expect(editor).toContainText('Hello World');
  });

  test('should show preview when enabled', async ({ page }) => {
    await page.goto('/editor');

    // 에디터에 내용 입력
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type('# Test Heading');

    // 프리뷰 표시
    const toggleBtn = page.getByRole('button', { name: /Preview/ });

    // 프리뷰가 숨겨져 있으면 표시
    const previewPanel = page.locator('.preview-panel');
    if (!(await previewPanel.isVisible())) {
      await toggleBtn.click();
    }

    // 프리뷰에 렌더링된 내용 확인
    await expect(previewPanel.locator('h1')).toContainText('Test Heading');
  });
});
