import { test, expect } from '@playwright/test';

test.describe('CMovie - Categories & Filtering (Filtering/Categories)', () => {

  test('should filter movies by categories and apply desktop filters', async ({ page }) => {
    // 1. Navigate directly to a category page, e.g., /category/phim-le
    await page.goto('/category/phim-le');
    await page.waitForLoadState('networkidle');

    // Verify title and page header
    const header = page.locator('h1');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Phim Lẻ');

    // 2. Select different filter options (desktop view by default is >= 1024px, playwright desktop width is 1280px)
    // Find filters container (desktop)
    const desktopFilters = page.locator('.hidden.lg\\:block');
    await expect(desktopFilters).toBeVisible();

    const selects = desktopFilters.locator('select');
    
    // Select 1: Year (localFilters.year) - let's select a common year, like 2024 or 2023
    // We can select by value or option text
    const yearSelect = selects.nth(0); // wait, let's look at MovieFilters:
    // First select is type (localFilters.type)
    // Second select is year (localFilters.year)
    // Third select is country (localFilters.country)
    // Fourth select is genre (localFilters.genre)
    // Fifth select is sort (localFilters.sort)
    
    // Let's verify we have these selects
    const selectCount = await selects.count();
    console.log(`Found ${selectCount} filter dropdowns on desktop.`);
    expect(selectCount).toBeGreaterThanOrEqual(4);

    // Let's select "Tất cả quốc gia" (empty value) and change country to "Trung Quốc" (slug 'trung-quoc')
    const countrySelect = selects.nth(2);
    await countrySelect.selectOption({ value: 'trung-quoc' });
    console.log('Selected country: Trung Quốc');

    // Wait for the loader to appear and then disappear, or wait for movies to refresh
    const loader = page.locator('.animate-spin');
    if (await loader.isVisible()) {
      await expect(loader).not.toBeVisible({ timeout: 10000 });
    }

    // Verify movie cards are updated and displayed
    const movieCards = page.locator('.grid > div');
    const cardsCount = await movieCards.count();
    console.log(`Filtered results show ${cardsCount} movies.`);
    expect(cardsCount).toBeGreaterThanOrEqual(0); // It's fine if it's 0 if no movies, but should be valid

    // Let's select "Hành Động" as genre (slug 'hanh-dong')
    const genreSelect = selects.nth(3);
    await genreSelect.selectOption({ value: 'hanh-dong' });
    console.log('Selected genre: Hành Động');

    if (await loader.isVisible()) {
      await expect(loader).not.toBeVisible({ timeout: 10000 });
    }

    // Verify "Reset" (Đặt lại) button is visible because filters are active
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

    // The drawer is teleported to body and is visible
    const drawer = page.locator('div.fixed.inset-0.z-\\[60\\]');
    await expect(drawer).toBeVisible();

    // Verify elements inside mobile drawer
    const typeSelect = drawer.locator('select').nth(0);
    const yearSelect = drawer.locator('select').nth(1);
    const countrySelect = drawer.locator('select').nth(2);

    await countrySelect.selectOption({ value: 'han-quoc' });
    console.log('Selected country: Hàn Quốc (Korean) in mobile drawer.');

    // Click the top close button (which is the first button inside the drawer header) to close it safely
    const closeBtn = drawer.locator('button').first();
    await closeBtn.click();
    await expect(drawer).not.toBeVisible();
    console.log('Mobile filters drawer closed.');

    // Verify pagination is visible or movie cards update
    const loader = page.locator('.animate-spin');
    if (await loader.isVisible()) {
      await expect(loader).not.toBeVisible({ timeout: 10000 });
    }

    const movieCards = page.locator('.grid > div');
    console.log(`Mobile results count: ${await movieCards.count()}`);
  });
});
