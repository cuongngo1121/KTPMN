import { test, expect } from '@playwright/test';

test.describe('CMovie - API Interception & Mocking Flow', () => {

  test('should display mock movies when API returns successful custom data', async ({ page }) => {
    // 1. Intercept the Home API call (v1/api/home) and return mock data
    await page.route('**/v1/api/home', async (route) => {
      const mockHomeData = {
        status: true,
        data: {
          items: [
            {
              _id: "mock-id-1",
              name: "Phim Gia Lap Playwright 1",
              slug: "phim-gia-lap-playwright-1",
              origin_name: "Playwright Mock Movie One",
              thumb_url: "mock-thumb-1.jpg",
              poster_url: "mock-poster-1.jpg",
              year: 2026,
              quality: "UHD 4K",
              content: "Day la phim gia lap dung de kiem thu tinh nang."
            },
            {
              _id: "mock-id-2",
              name: "Phim Gia Lap Playwright 2",
              slug: "phim-gia-lap-playwright-2",
              origin_name: "Playwright Mock Movie Two",
              thumb_url: "mock-thumb-2.jpg",
              poster_url: "mock-poster-2.jpg",
              year: 2025,
              quality: "FHD",
              content: "Phim gia lap thu hai de test danh sach trending."
            }
          ]
        }
      };

      console.log('🔄 Playwright intercepted API: v1/api/home and returned mock data.');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockHomeData),
      });
    });

    // 2. Navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 3. Verify that the UI displays the mocked movies instead of real movies from ophim1.com
    // In TrendingSection.vue, the first movie becomes the featured movie (large layout) on desktop view
    const featuredTitle = page.locator('h3:has-text("Phim Gia Lap Playwright 1")').filter({ visible: true }).first();
    await expect(featuredTitle).toBeVisible();

    // The second movie will be placed in the vertical top list (index + 2)
    const secondMovieItem = page.locator('text=Phim Gia Lap Playwright 2').filter({ visible: true }).first();
    await expect(secondMovieItem).toBeVisible();

    console.log('✅ Successful API mocking test passed: Custom movies rendered on screen.');
  });

  test('should handle API failure (500) gracefully and stop loading skeleton', async ({ page }) => {
    // 1. Intercept the Home API call and return HTTP 500 Internal Server Error
    await page.route('**/v1/api/home', async (route) => {
      console.log('⚠️ Playwright intercepted API: v1/api/home and simulated a 500 error.');
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    // 2. Navigate to homepage
    await page.goto('/');

    // 3. Verify that the loading skeleton is hidden after the API request fails (onMounted finally block runs)
    // In TrendingSection.vue, if loading is true, it displays grid containing skeletons. 
    // After finally block executes, loading becomes false.
    const loadingSkeleton = page.locator('.animate-\\[shimmer_1\\.5s_infinite\\]');
    
    // We expect loading skeleton to disappear eventually
    await expect(loadingSkeleton.first()).not.toBeVisible({ timeout: 5000 });

    // Since the API failed and returned no items, the featured movie heading should not exist
    const featuredHeading = page.locator('h3:has-text("Trending")');
    await expect(featuredHeading).not.toBeVisible();

    console.log('✅ API failure test passed: App handled 500 error without crashing the page.');
  });

});
