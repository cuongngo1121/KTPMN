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



  test('should show slow loading shimmer effect when API response is delayed (5s)', async ({ page }) => {
    await page.route('**/v1/api/home', async route => {
      // Delay response to simulate slow network
      await new Promise(f => setTimeout(f, 5000));
      await route.continue();
    });
    // Do not await the full load since we want to check the loading state
    page.goto('/');

    // Check if the loading skeleton (shimmer effect) is visible during the delay
    const loadingSkeleton = page.locator('.animate-\\[shimmer_1\\.5s_infinite\\]');
    await expect(loadingSkeleton.first()).toBeVisible({ timeout: 2000 });
  });

  test('should display Not Found Error UI when API returns 404', async ({ page }) => {
    await page.route('**/danh-sach/phim-moi-cap-nhat*', route => {
      route.fulfill({ status: 404, body: 'Not Found' });
    });
    await page.goto('/');

    // Assert that a 404 error message or Not Found state is displayed to the user
    const notFoundMessage = page.locator('text=/404|not found|không tìm thấy/i');
    await expect(notFoundMessage.first()).toBeVisible();
  });

  test('should display Access Denied Error UI when API returns 403 Forbidden', async ({ page }) => {
    await page.route('**/danh-sach/phim-moi-cap-nhat*', route => {
      route.fulfill({ status: 403, body: 'Forbidden' });
    });
    await page.goto('/');

    // Assert that a 403 error message or Access Denied state is displayed
    const accessDeniedMessage = page.locator('text=/403|forbidden|access denied|từ chối truy cập|không có quyền/i');
    await expect(accessDeniedMessage.first()).toBeVisible();
  });

  test('should not crash frontend when Backend returns malformed JSON string', async ({ page }) => {
    await page.route('**/danh-sach/phim-moi-cap-nhat*', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{ invalid_json: ' });
    });
    await page.goto('/');

    // Page should still load layout elements (nav/header) without a white screen of death
    await expect(page.locator('nav').or(page.locator('header')).first()).toBeVisible();

    // Should gracefully show an error message or generic empty state
    const errorState = page.locator('text=/lỗi|error|không thể tải/i');
    await expect(errorState.or(page.locator('.empty-state'))).not.toBeHidden();
  });

  test('should display fallback image placeholder when API returns movie without thumbnail', async ({ page }) => {
    await page.route('**/v1/api/home', route => {
      const mockData = {
        status: true,
        data: { items: [{ _id: "1", name: "No Image Movie", slug: "no-image", thumb_url: "", poster_url: "" }] }
      };
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockData) });
    });
    await page.goto('/');

    // Find the image element and check that its src contains a fallback/placeholder identifier
    const movieImage = page.locator('img[alt*="No Image Movie"]').or(page.locator('img').first());
    await expect(movieImage).toBeVisible();

    const src = await movieImage.getAttribute('src');
    expect(src).toMatch(/default|placeholder|fallback|error|null/i);
  });

  test('should display network offline banner when internet connection drops entirely', async ({ page }) => {
    // 1. Load the page normally first
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. Simulate dropping the internet connection
    await page.context().setOffline(true);

    // 3. Trigger some network action or wait for offline detector to show banner
    const offlineBanner = page.locator('text=/offline|không có kết nối mạng|mất mạng|no internet/i');
    await expect(offlineBanner.first()).toBeVisible();

    // Clean up
    await page.context().setOffline(false);
  });

  test('should handle null pagination parameters gracefully from backend', async ({ page }) => {
    await page.route('**/danh-sach/phim-moi-cap-nhat*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], pagination: null })
      });
    });
    await page.goto('/');

    // Pagination controls should not be visible or crash the page
    const paginationControls = page.locator('.pagination, nav[aria-label="pagination"]');
    await expect(paginationControls).not.toBeVisible();

    // Should gracefully display empty items indicator
    const noMoviesText = page.locator('text=/chưa có phim|không có dữ liệu|trống|no movies/i');
    await expect(noMoviesText.or(page.locator('.empty-state'))).not.toBeHidden();
  });

  test('should render movies correctly even with anomalous release dates (e.g. Year 3000)', async ({ page }) => {
    await page.route('**/v1/api/home', route => {
      const mockData = {
        status: true,
        data: { items: [{ _id: "2", name: "Future Movie", slug: "future-movie", year: 3000, thumb_url: "thumb.jpg", poster_url: "poster.jpg" }] }
      };
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData)
      });
    });
    await page.goto('/');

    // Ensure the anomalous year "3000" is rendered on the UI successfully
    const yearElement = page.locator('text="3000"');
    await expect(yearElement.first()).toBeAttached();
    
    const movieTitle = page.locator('text="Future Movie"');
    await expect(movieTitle.first()).toBeAttached();
  });

});
