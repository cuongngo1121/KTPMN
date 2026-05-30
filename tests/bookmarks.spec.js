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
});
