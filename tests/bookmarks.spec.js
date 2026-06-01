import { test, expect } from '@playwright/test';

test.describe('CMovie - Bookmarks & Watchlist Flow (Tủ Phim)', () => {

  test('should verify empty state, add a movie to bookmarks, verify it in watchlist, and remove it', async ({ page }) => {
    // 1. Go to bookmarks page first and verify empty state
    await page.goto('/tu-phim');
    await page.waitForLoadState('networkidle');

    // Verify Title
    const header = page.locator('h1');
    await expect(header).toContainText('Tủ Phim Của Bạn');

    // Verify Empty State elements
    const emptyStateTitle = page.locator('h3', { hasText: 'Tủ phim đang trống!' });
    await expect(emptyStateTitle).toBeVisible();

    const exploreBtn = page.locator('button', { hasText: 'Khám phá phim ngay' });
    await expect(exploreBtn).toBeVisible();

    // 2. Click explore button to go to homepage
    await exploreBtn.click();
    await page.waitForURL('/');
    await page.waitForLoadState('networkidle');
    console.log('Successfully navigated to home page via explore button.');

    // 3. Click the first movie card to go to detail page
    const firstMovieCard = page.locator('.movie-card:visible').first();
    await expect(firstMovieCard).toBeVisible({ timeout: 10000 });

    // Get movie name to verify later
    const movieNameOnHome = await firstMovieCard.locator('.font-bold').first().textContent();
    console.log(`First movie card name on home: ${movieNameOnHome}`);

    await firstMovieCard.click();
    await page.waitForURL(/\/movie\/.+/);
    console.log(`Movie detail page loaded: ${page.url()}`);

    // Verify bookmark button exists (the button with title="Lưu phim" or heart icon)
    const bookmarkBtn = page.locator('button[title="Lưu phim"]').first();
    await expect(bookmarkBtn).toBeVisible();

    // The heart svg inside should not be filled initially (or if it is, we toggle it)
    // Click bookmark button
    await bookmarkBtn.click();
    console.log('Clicked bookmark button.');

    // 4. Go to bookmarks page again
    await page.goto('/tu-phim');
    await page.waitForLoadState('networkidle');

    // Verify that the empty state is NO longer visible
    await expect(emptyStateTitle).not.toBeVisible();

    // Verify that 1 movie is bookmarked
    const countBadge = page.locator('div', { hasText: 'phim đã lưu' }).first();
    await expect(countBadge).toContainText('1 phim đã lưu');

    // Verify the movie card matches the one we bookmarked
    const bookmarkedMovieCard = page.locator('.movie-card').first();
    await expect(bookmarkedMovieCard).toBeVisible();

    // Click the movie card inside bookmarks to go back to detail page and remove bookmark
    await bookmarkedMovieCard.click();
    await page.waitForURL(/\/movie\/.+/);
    console.log('Navigated back to movie detail from bookmarks page.');

    // Click bookmark button again to remove bookmark
    const activeBookmarkBtn = page.locator('button[title="Lưu phim"]').first();
    await activeBookmarkBtn.click();
    console.log('Clicked bookmark button again to remove bookmark.');

    // 5. Navigate to /tu-phim one last time and verify empty state returns
    await page.goto('/tu-phim');
    await page.waitForLoadState('networkidle');

    await expect(emptyStateTitle).toBeVisible();
    await expect(countBadge).toContainText('0 phim đã lưu');
    console.log('Watchlist addition and removal E2E flow verified successfully.');
  });


  test('should allow adding multiple distinct movies to bookmarks rapidly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Add first movie
    const firstMovieCard = page.locator('.movie-card:visible').nth(0);
    await firstMovieCard.click();
    await page.waitForURL(/\/movie\/.+/);
    await page.locator('button[title="Lưu phim"]').first().click();

    // Add second movie
    await page.goto('/');
    const secondMovieCard = page.locator('.movie-card:visible').nth(1);
    await secondMovieCard.click();
    await page.waitForURL(/\/movie\/.+/);
    await page.locator('button[title="Lưu phim"]').first().click();

    // Verify both are saved in tu-phim
    await page.goto('/tu-phim');
    const savedMovies = page.locator('.movie-card');
    await expect(savedMovies).toHaveCount(2);
  });

  test('should reflect exact bookmark count in the bookmarks page', async ({ page }) => {
    // Add 1 movie via UI
    await page.goto('/');
    await page.locator('.movie-card:visible').first().click();
    await page.waitForURL(/\/movie\/.+/);
    await page.locator('button[title="Lưu phim"]').first().click();

    await page.goto('/tu-phim');

    // Check if there is a text indicating the count
    const countBadge = page.locator('div', { hasText: 'phim đã lưu' }).first();
    await expect(countBadge).toBeVisible();
    await expect(countBadge).toContainText('1 phim đã lưu');
  });

  test('should allow toggling bookmark directly from the homepage on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for quick bookmark toggle on the homepage movie cards (mobile only)
    // Target a visible movie card to avoid hidden slider items
    const quickBookmarkBtn = page.locator('.movie-card:visible button.md\\:hidden').first();
    await quickBookmarkBtn.click({ force: true });

    // Go to bookmarks to verify it was added
    await page.goto('/tu-phim');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.movie-card:visible').first()).toBeVisible();

    // Go back and remove it
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const quickBookmarkBtnRemove = page.locator('.movie-card:visible button.md\\:hidden').first();
    await quickBookmarkBtnRemove.click({ force: true });

    await page.goto('/tu-phim');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.movie-card')).toHaveCount(0);
  });

  test('should persist bookmarks data in LocalStorage across page reloads (F5)', async ({ page }) => {
    // Add via UI
    await page.goto('/');
    await page.locator('.movie-card:visible').first().click();
    await page.waitForURL(/\/movie\/.+/);
    await page.locator('button[title="Lưu phim"]').first().click();

    await page.goto('/tu-phim');
    await expect(page.locator('.movie-card').first()).toBeVisible();

    // Reload (F5) and verify data persists
    await page.reload();
    await expect(page.locator('.movie-card').first()).toBeVisible();
  });

  test('should redirect to correct movie watch page when clicking a bookmarked item', async ({ page }) => {
    // Add via UI
    await page.goto('/');
    await page.locator('.movie-card:visible').first().click();
    await page.waitForURL(/\/movie\/.+/);
    const expectedUrl = page.url();
    await page.locator('button[title="Lưu phim"]').first().click();

    await page.goto('/tu-phim');
    const bookmarkedMovie = page.locator('.movie-card').first();
    await expect(bookmarkedMovie).toBeVisible();

    await bookmarkedMovie.click();
    await page.waitForURL(/\/movie\/.+/);
    // Should navigate to detail page
    expect(page.url()).toBe(expectedUrl);
  });

  test('should allow toggling bookmark from homepage via desktop hover popup', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Hover the first visible movie card to trigger popup
    const firstMovieCard = page.locator('.movie-card:visible').first();
    await firstMovieCard.scrollIntoViewIfNeeded();
    await firstMovieCard.hover();
    
    // Wait for popup and click bookmark button
    const popupBookmarkBtn = page.locator('button[title="Lưu phim"]').first();
    await expect(popupBookmarkBtn).toBeVisible();
    await popupBookmarkBtn.click();

    // Verify in tu-phim
    await page.goto('/tu-phim');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.movie-card:visible').first()).toBeVisible();

    // Click into detail page and remove
    await page.locator('.movie-card:visible').first().click();
    await page.waitForURL(/\/movie\/.+/);
    
    const removeBtn = page.locator('button[title="Lưu phim"]').first();
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();
    
    await page.goto('/tu-phim');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.movie-card')).toHaveCount(0);
  });

  test('should prevent duplicate movie entries in bookmarks state', async ({ page }) => {
    await page.goto('/');
    const firstMovieCard = page.locator('.movie-card:visible').first();
    await firstMovieCard.click();
    await page.waitForURL(/\/movie\/.+/);

    const bookmarkBtn = page.locator('button[title="Lưu phim"]').first();
    await expect(bookmarkBtn).toBeVisible();

    // Click rapidly multiple times
    await bookmarkBtn.click();
    await bookmarkBtn.click();
    await bookmarkBtn.click();

    // Retrieve localStorage and assert at most 1 item exists
    const bookmarksStr = await page.evaluate(() => window.localStorage.getItem('bookmarks') || '[]');
    const bookmarks = JSON.parse(bookmarksStr);

    expect(bookmarks.length).toBeLessThanOrEqual(1);
  });

  test('should render bookmarks grid correctly on Mobile Viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    // Add via UI
    await page.goto('/');
    await page.locator('.movie-card:visible').first().click();
    await page.waitForURL(/\/movie\/.+/);
    await page.locator('button[title="Lưu phim"]').first().click();

    await page.goto('/tu-phim');

    const firstCard = page.locator('.movie-card').first();
    await expect(firstCard).toBeVisible();

    // Ensure no horizontal scroll is introduced
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });

  test('should render bookmarks grid correctly on Tablet Viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    // Add via UI
    await page.goto('/');
    await page.locator('.movie-card:visible').first().click();
    await page.waitForURL(/\/movie\/.+/);
    await page.locator('button[title="Lưu phim"]').first().click();

    await page.goto('/tu-phim');

    const firstCard = page.locator('.movie-card').first();
    await expect(firstCard).toBeVisible();

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(768);
  });

});
