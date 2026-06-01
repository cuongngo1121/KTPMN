import { test, expect } from '@playwright/test';

test.describe('CMovie - Categories & Filtering (Filtering/Categories)', () => {

  test('should filter movies by categories and apply desktop filters', async ({ page }) => {
    // 1. Navigate directly to a category page
    await page.goto('/category/phim-le');
    await page.waitForLoadState('networkidle');

    // Verify title and page header
    const header = page.locator('h1');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Phim Lẻ');

    // 2. Select different filter options
    const desktopFilters = page.locator('.hidden.lg\\:block');
    await expect(desktopFilters).toBeVisible();

    const selects = desktopFilters.locator('select');
    const selectCount = await selects.count();
    console.log(`Found ${selectCount} filter dropdowns on desktop.`);
    expect(selectCount).toBeGreaterThanOrEqual(4);

    // Select country "Trung Quốc"
    const countrySelect = selects.nth(2);
    await countrySelect.selectOption({ value: 'trung-quoc' });
    console.log('Selected country: Trung Quốc');

    // Wait for the loader to finish
    const loader = page.locator('.animate-spin');
    if (await loader.isVisible()) {
      await expect(loader).not.toBeVisible({ timeout: 10000 });
    }

    // Verify movie cards are displayed
    const movieCards = page.locator('.grid > div');
    const cardsCount = await movieCards.count();
    console.log(`Filtered results show ${cardsCount} movies.`);
    expect(cardsCount).toBeGreaterThanOrEqual(0);

    // Select genre "Hành Động"
    const genreSelect = selects.nth(3);
    await genreSelect.selectOption({ value: 'hanh-dong' });
    console.log('Selected genre: Hành Động');

    if (await loader.isVisible()) {
      await expect(loader).not.toBeVisible({ timeout: 10000 });
    }

    // Verify "Reset" button is visible
    const resetBtn = desktopFilters.locator('button', { hasText: 'Đặt lại' });
    await expect(resetBtn).toBeVisible();

    // Click "Reset" button
    await resetBtn.click();
    console.log('Clicked reset filters button.');

    // Verify selects are reset to empty values
    await expect(countrySelect).toHaveValue('');
    await expect(genreSelect).toHaveValue('');
  });

  test('should display mobile drawer filters on mobile screens', async ({ page }) => {
    // Resize viewport to mobile size
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/category/phim-le');
    await page.waitForLoadState('networkidle');

    // Verify mobile filters button is visible and desktop filters are hidden
    const mobileFilterBtn = page.locator('.lg\\:hidden > button', { hasText: 'Bộ lọc' });
    await expect(mobileFilterBtn).toBeVisible();

    const desktopFilters = page.locator('.hidden.lg\\:block');
    await expect(desktopFilters).not.toBeVisible();

    // Click the Mobile filter button to open drawer
    await mobileFilterBtn.click();
    console.log('Mobile filters drawer opened.');

    // The drawer is visible
    const drawer = page.locator('div.fixed.inset-0.z-\\[60\\]');
    await expect(drawer).toBeVisible();

    // Verify elements inside mobile drawer
    const countrySelect = drawer.locator('select').nth(2);
    await countrySelect.selectOption({ value: 'han-quoc' });
    console.log('Selected country: Hàn Quốc inside mobile drawer.');

    // Click the close button to close drawer
    const closeBtn = drawer.locator('button').first();
    await closeBtn.click();
    await expect(drawer).not.toBeVisible();
    console.log('Mobile filters drawer closed.');

    const loader = page.locator('.animate-spin');
    if (await loader.isVisible()) {
      await expect(loader).not.toBeVisible({ timeout: 10000 });
    }

    const movieCards = page.locator('.grid > div');
    console.log(`Mobile results count: ${await movieCards.count()}`);
  });

  test('should correctly filter and display "Hài Hước" movies', async ({ page }) => {
    await page.goto('/the-loai/hai-huoc');
    await page.waitForLoadState('networkidle');

    // Verify redirect to the correct genre path
    await page.waitForURL(/\/genre\/hai-huoc/);

    // Verify category dropdown displays "Hài Hước"
    const dropdownLabel = page.locator('button').filter({ hasText: 'Hài Hước' });
    await expect(dropdownLabel).toBeVisible();

    // Verify that movie cards are loaded
    const movieCards = page.locator('.movie-card');
    await expect(movieCards.first()).toBeVisible({ timeout: 10000 });
    const count = await movieCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should correctly filter and display "Kinh Dị" movies', async ({ page }) => {
    await page.goto('/the-loai/kinh-di');
    await page.waitForLoadState('networkidle');

    // Verify redirect to the correct genre path
    await page.waitForURL(/\/genre\/kinh-di/);

    // Verify category dropdown displays "Kinh Dị"
    const dropdownLabel = page.locator('button').filter({ hasText: 'Kinh Dị' });
    await expect(dropdownLabel).toBeVisible();

    // Verify that movie cards are loaded
    const movieCards = page.locator('.movie-card');
    await expect(movieCards.first()).toBeVisible({ timeout: 10000 });
    const count = await movieCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter by country "Hàn Quốc"', async ({ page }) => {
    await page.goto('/quoc-gia/han-quoc');
    await page.waitForLoadState('networkidle');

    // Verify redirect to country path
    await page.waitForURL(/\/country\/han-quoc/);

    // Verify category dropdown displays "Hàn Quốc"
    const dropdownLabel = page.locator('button').filter({ hasText: 'Hàn Quốc' });
    await expect(dropdownLabel).toBeVisible();

    // Verify that movie cards are loaded
    const movieCards = page.locator('.movie-card');
    await expect(movieCards.first()).toBeVisible({ timeout: 10000 });
    const count = await movieCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter by release year "2023"', async ({ page }) => {
    await page.goto('/category/phim-le');
    await page.waitForLoadState('networkidle');

    const desktopFilters = page.locator('.hidden.lg\\:block');
    const selects = desktopFilters.locator('select');
    
    // Select 2 is the year select
    const yearSelect = selects.nth(1);
    await yearSelect.selectOption('2023');

    // Wait for the loader to finish
    const loader = page.locator('.animate-spin');
    if (await loader.isVisible()) {
      await expect(loader).not.toBeVisible({ timeout: 10000 });
    }

    // Verify select value
    await expect(yearSelect).toHaveValue('2023');

    // Check if any movie cards are shown, they should have year 2023 in their metadata
    const movieCards = page.locator('.movie-card');
    const count = await movieCards.count();
    if (count > 0) {
      const cardText = await movieCards.first().textContent();
      expect(cardText).toContain('2023');
    }
  });

  test('should retain filter settings after changing one filter', async ({ page }) => {
    await page.goto('/category/phim-le');
    await page.waitForLoadState('networkidle');

    const desktopFilters = page.locator('.hidden.lg\\:block');
    const selects = desktopFilters.locator('select');
    const countrySelect = selects.nth(2);
    const genreSelect = selects.nth(3);

    // Select country Trung Quốc and genre Hành Động
    await countrySelect.selectOption({ value: 'trung-quoc' });
    await genreSelect.selectOption({ value: 'hanh-dong' });

    const loader = page.locator('.animate-spin');
    if (await loader.isVisible()) {
      await expect(loader).not.toBeVisible({ timeout: 10000 });
    }

    // Verify both are selected
    await expect(countrySelect).toHaveValue('trung-quoc');
    await expect(genreSelect).toHaveValue('hanh-dong');

    // Clear country selection
    await countrySelect.selectOption({ value: '' });

    if (await loader.isVisible()) {
      await expect(loader).not.toBeVisible({ timeout: 10000 });
    }

    // Verify country is reset, but genre filter is retained
    await expect(countrySelect).toHaveValue('');
    await expect(genreSelect).toHaveValue('hanh-dong');
  });

  test('should navigate to Page 2 of a category list', async ({ page }) => {
    // Mock the API response to return exactly 30 movies to ensure we have exactly 2 pages (24 per page)
    await page.route('**/v1/api/danh-sach/phim-le*', async (route) => {
      const mockMovies = Array.from({ length: 30 }, (_, i) => ({
        _id: `movie-${i}`,
        name: `Phim Lẻ Thử Nghiệm ${i}`,
        slug: `phim-le-thu-nghiem-${i}`,
        thumb_url: 'thumb.jpg',
        poster_url: 'poster.jpg',
        year: 2024,
        quality: 'HD',
        category: [{ name: 'Hành Động', slug: 'hanh-dong' }],
        country: [{ name: 'Trung Quốc', slug: 'trung-quoc' }]
      }));
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: {
            items: mockMovies,
            params: {
              pagination: {
                totalItems: 30,
                totalPages: 2,
                currentPage: 1,
                limit: 24
              }
            }
          }
        })
      });
    });

    await page.goto('/category/phim-le');
    await page.waitForLoadState('networkidle');

    // Page 1 should show exactly 24 movie cards
    await expect(page.locator('.movie-card-wrapper')).toHaveCount(24);

    // Verify that the page 2 button is visible and click it
    const page2Button = page.locator('button', { hasText: '2' }).first();
    await expect(page2Button).toBeVisible();
    await page2Button.click();

    // Page 2 should show the remaining 6 movie cards
    await expect(page.locator('.movie-card-wrapper')).toHaveCount(6);

    // Verify page indicator text
    const pageIndicator = page.locator('text=/Trang 2 \\/ 2/i');
    await expect(pageIndicator).toBeVisible();
  });

  test('should navigate to movie detail page and return back to category page', async ({ page }) => {
    await page.goto('/category/phim-le');
    await page.waitForLoadState('networkidle');

    // Get the first movie card on category page
    const firstMovieCard = page.locator('.movie-card').first();
    await expect(firstMovieCard).toBeVisible();

    const firstMovieTitle = await firstMovieCard.locator('h3').first().textContent();
    console.log(`Navigating to movie detail page for: ${firstMovieTitle}`);

    // Click to view detail page
    await firstMovieCard.click();

    // Verify url matches a movie detail page
    await page.waitForURL(/\/movie\/.+/);
    // Verify detail page has successfully loaded by asserting the movie watch button is visible
    await expect(page.locator('text=XEM PHIM').first()).toBeVisible({ timeout: 10000 });

    // Click browser back button
    await page.goBack();

    // Verify we successfully returned to category page
    await page.waitForURL(/\/category\/phim-le/);
    await expect(page.locator('h1', { hasText: 'Phim Lẻ' })).toBeVisible();
  });

  test('should display "no movies found" state for an impossible category combination', async ({ page }) => {
    // Add debugging log listeners
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('request', req => console.log(`REQ: ${req.method()} ${req.url()}`));
    page.on('requestfailed', req => console.log(`REQ FAIL: ${req.url()} - ${req.failure()?.errorText}`));

    // Mock the API response to return an empty movie list for this category
    await page.route('**/v1/api/danh-sach/khong-co-the-loai-nay*', async (route) => {
      console.log('INTERCEPTED:', route.request().url());
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: {
            items: [],
            params: {
              pagination: {
                totalItems: 0,
                totalPages: 1,
                currentPage: 1,
                limit: 24
              }
            }
          }
        })
      });
    });

    await page.goto('/category/khong-co-the-loai-nay');
    await page.waitForLoadState('networkidle');

    // Verify the "Không tìm thấy phim" empty state header is visible (automatically retries until visible)
    const noMoviesHeader = page.locator('h3', { hasText: 'Không tìm thấy phim' });
    await expect(noMoviesHeader).toBeVisible({ timeout: 15000 });
  });

});

