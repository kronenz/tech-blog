/**
 * E2E Tests: Editor
 * 마크다운 에디터 기능 테스트
 */
import { test, expect } from '@playwright/test';

test.describe('Markdown Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor');
    // React 컴포넌트가 hydrate될 때까지 대기
    await page.waitForSelector('.markdown-editor', { timeout: 10000 });
  });

  test('should render editor page', async ({ page }) => {
    // 에디터 페이지 타이틀 확인
    await expect(page).toHaveTitle(/AI Markdown Editor/);

    // 에디터 컴포넌트 확인
    await expect(page.locator('.markdown-editor')).toBeVisible();
  });

  test('should have toolbar with all buttons', async ({ page }) => {
    // 툴바 확인
    const toolbar = page.locator('.editor-toolbar');
    await expect(toolbar).toBeVisible();

    // 주요 버튼들 확인 (toolbar 내에서만 검색)
    await expect(toolbar.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(toolbar.getByRole('button', { name: 'Export' })).toBeVisible();
    await expect(toolbar.getByRole('button', { name: 'Publish' })).toBeVisible();
    await expect(toolbar.locator('button').filter({ hasText: 'Settings' })).toBeVisible();
  });

  test('should have editor panel', async ({ page }) => {
    // 에디터 패널 확인
    const editorPanel = page.locator('.editor-panel');
    await expect(editorPanel).toBeVisible();

    // CodeMirror 에디터 확인
    const cmEditor = page.locator('.cm-editor');
    await expect(cmEditor).toBeVisible();
  });

  test('should toggle preview panel', async ({ page }) => {
    // 초기 상태에서 프리뷰 토글
    const toolbar = page.locator('.editor-toolbar');
    const toggleBtn = toolbar.getByRole('button', { name: /Preview/ });
    await toggleBtn.click();

    // 프리뷰 패널 표시 확인 (토글 상태에 따라)
    const previewPanel = page.locator('.preview-panel');
    // 프리뷰가 보이거나 숨겨짐
    const isVisible = await previewPanel.isVisible();

    // 다시 토글
    await toggleBtn.click();

    // 상태가 변경되었는지 확인
    const isVisibleAfter = await previewPanel.isVisible();
    expect(isVisible).not.toBe(isVisibleAfter);
  });

  test('should open publish modal', async ({ page }) => {
    // toolbar 내 Publish 버튼 클릭
    const toolbar = page.locator('.editor-toolbar');
    const publishBtn = toolbar.getByRole('button', { name: 'Publish' });
    await publishBtn.waitFor({ state: 'visible' });
    await publishBtn.click();

    // 모달 확인 (약간의 딜레이 허용)
    const modal = page.locator('.modal-overlay');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // 모달 내용 확인
    await expect(page.locator('.modal-title')).toContainText('포스트 발행');

    // 필수 필드 확인
    await expect(page.locator('input[placeholder*="제목"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="slug"]')).toBeVisible();
  });

  test('should close publish modal on cancel', async ({ page }) => {
    // toolbar 내 Publish 버튼 클릭
    const toolbar = page.locator('.editor-toolbar');
    await toolbar.getByRole('button', { name: 'Publish' }).click();

    // 모달 확인
    await expect(page.locator('.modal-overlay')).toBeVisible();

    // 취소 버튼 클릭
    await page.getByRole('button', { name: '취소' }).click();

    // 모달 닫힘 확인
    await expect(page.locator('.modal-overlay')).not.toBeVisible();
  });

  test('should close publish modal on escape key', async ({ page }) => {
    // toolbar 내 Publish 버튼 클릭
    const toolbar = page.locator('.editor-toolbar');
    await toolbar.getByRole('button', { name: 'Publish' }).click();

    // 모달 확인
    await expect(page.locator('.modal-overlay')).toBeVisible();

    // ESC 키 누름
    await page.keyboard.press('Escape');

    // 모달 닫힘 확인
    await expect(page.locator('.modal-overlay')).not.toBeVisible();
  });

  test('should open settings modal', async ({ page }) => {
    // toolbar 내 Settings 버튼 클릭
    const toolbar = page.locator('.editor-toolbar');
    const settingsBtn = toolbar.locator('button').filter({ hasText: 'Settings' });
    await settingsBtn.waitFor({ state: 'visible' });
    await settingsBtn.click();

    // SettingsModal은 인라인 스타일 overlay를 사용함 (h2에 "설정" 텍스트 확인)
    await expect(page.locator('h2').filter({ hasText: '설정' })).toBeVisible({ timeout: 5000 });
  });
});
