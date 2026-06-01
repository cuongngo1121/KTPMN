import { test, expect } from '@playwright/test';

test.describe('CMovie - Search & Real-time Results Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
    // Wait for the app/page load (wait for navbar or welcome screen if any)
    await page.waitForLoadState('networkidle');
  });

  test('should open search bar, perform real-time search, and display matches', async ({ page }) => {
    const searchIcon = page.locator('.search-icon-btn').first();
    const searchContainer = page.locator('.search-container').first();
    const searchInput = page.locator('input.search-input-field').first();
    const resultsDropdown = page.locator('.results-dropdown').first();

    // 1. Initial State: Search input should not be open/visible
    await expect(searchContainer).not.toHaveClass(/is-open/);
    await expect(searchInput).not.toBeVisible();

    // 2. Click search icon to open search
    await searchIcon.click();
    await expect(searchContainer).toHaveClass(/is-open/);
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeFocused();

    // 3. Type search keyword (real-time input)
    // We search for a very common word in Vietnamese titles like "Thần" or "Đại" or "Thiên"
    const keyword = 'Đại';
    await searchInput.fill(keyword);

    // 4. Verify dropdown is shown
    await expect(resultsDropdown).toBeVisible();

    // 5. Verify results are loaded and display items
    // Results might take some time to fetch due to API latency and 300ms debounce
    const resultItem = page.locator('.result-item');
    await expect(resultItem.first()).toBeVisible({ timeout: 10000 });

    const resultCount = await resultItem.count();
    console.log(`Search for "${keyword}" returned ${resultCount} real-time items.`);
    expect(resultCount).toBeGreaterThan(0);

    // Verify first result title contains text or exists
    const firstTitle = await resultItem.first().locator('.result-title').textContent();
    console.log(`First result title: ${firstTitle}`);
    expect(firstTitle).toBeTruthy();

    // 6. Click on the first search result item
    await resultItem.first().click();

    // 7. Verify navigation to the movie details page (URL path starts with /movie/)
    await page.waitForURL(/\/movie\/.+/);
    console.log(`Successfully navigated to movie details: ${page.url()}`);
    expect(page.url()).toContain('/movie/');
  });

  test('should display "no results" state for non-existent keywords', async ({ page }) => {
    const searchIcon = page.locator('.search-icon-btn').first();
    const searchInput = page.locator('input.search-input-field').first();
    const noResultsState = page.locator('.no-results-state').first();

    await searchIcon.click();

    // Type a keyword that won't match any movie
    const bizarreKeyword = 'xzy_non_existent_movie_9999';
    await searchInput.fill(bizarreKeyword);

    // Verify the "no results" state appears
    await expect(noResultsState).toBeVisible({ timeout: 10000 });
    const noResultsTitle = await page.locator('.no-results-title').textContent();
    // The no-results message should NOT be empty
    expect(noResultsTitle.trim().length).toBeGreaterThan(0);
    console.log(`No results message: "${noResultsTitle.trim()}"`);
    console.log('No results state verified successfully.');
  });

  test('should be able to clear search query using close button', async ({ page }) => {
    const searchIcon = page.locator('.search-icon-btn').first();
    const searchInput = page.locator('input.search-input-field').first();
    const clearBtn = page.locator('button.close-btn').first();
    const resultsDropdown = page.locator('.results-dropdown').first();

    await searchIcon.click();
    await searchInput.fill('Batman');

    // Verify clear button is visible
    await expect(clearBtn).toBeVisible();
    await expect(resultsDropdown).toBeVisible();

    // Click clear button with force: true to bypass backdrop overlay pointer event interception
    await clearBtn.click({ force: true });

    // Input should be empty and dropdown should close
    await expect(searchInput).toHaveValue('');
    await expect(resultsDropdown).not.toBeVisible();
    console.log('Search clearing functionality verified successfully.');
  });

  test('should display initial welcome state on mobile when clicking search tab on bottom navigation dock', async ({ page }) => {
    // 1. Configure to Mobile Portrait
    await page.setViewportSize({ width: 375, height: 812 });

    // 2. Go to homepage first
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 3. Click the "Tìm kiếm" button on the bottom nav dock
    const searchTabBtn = page.locator('nav.fixed button', { hasText: 'Tìm kiếm' }).first();
    await expect(searchTabBtn).toBeVisible();
    await searchTabBtn.click();

    // 4. Verify we are navigated to /tim-kiem
    await page.waitForURL(/\/tim-kiem/);
    console.log('Navigated to /tim-kiem via mobile bottom nav tab.');

    // 5. We expect a welcome/intro state (e.g. "Tìm Kiếm Phim")
    const welcomeTitle = page.locator('h3', { hasText: 'Tìm Kiếm Phim' });
    
    // We assert this is visible to capture the bug (it will fail because current code shows the empty state instead)
    await expect(welcomeTitle).toBeVisible();

    // 6. We expect the empty/error state is NOT visible when we haven't typed anything
    const emptyStateTitle = page.locator('h3', { hasText: 'Tìm hoài không thấy!' });
    await expect(emptyStateTitle).not.toBeVisible();
  });


  test('should not submit search when entering only whitespace', async ({ page }) => {
    const searchIcon = page.locator('.search-icon-btn').first();
    await searchIcon.click();
    const searchInput = page.locator('input.search-input-field').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('     ');
    await page.waitForTimeout(600); // Wait for debounce
    // Whitespace should NOT trigger a search - no results and no dropdown should appear
    const resultsDropdown = page.locator('.results-dropdown').first();
    await expect(resultsDropdown).not.toBeVisible();
  });

  test('should handle special characters input gracefully', async ({ page }) => {
    const searchIcon = page.locator('.search-icon-btn').first();
    await searchIcon.click();
    const searchInput = page.locator('input.search-input-field').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('@#$%^&*');
    const noResults = page.locator('.no-results-title');
    await expect(noResults).toBeVisible({ timeout: 10000 });
  });

  test('should handle extremely long keywords (>100 chars) without breaking UI layout', async ({ page }) => {
    const searchIcon = page.locator('.search-icon-btn').first();
    await searchIcon.click();
    const searchInput = page.locator('input.search-input-field').first();
    await expect(searchInput).toBeVisible();
    const longString = 'A'.repeat(150);
    await searchInput.fill(longString);
    const noResults = page.locator('.no-results-title');
    await expect(noResults).toBeVisible({ timeout: 10000 });
  });

  test('should sanitize potential XSS script injections in search input', async ({ page }) => {
    const searchIcon = page.locator('.search-icon-btn').first();
    await searchIcon.click();
    const searchInput = page.locator('input.search-input-field').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('<script>alert(1)</script>');
    const noResults = page.locator('.no-results-title');
    await expect(noResults).toBeVisible({ timeout: 10000 });
  });

  test('should allow toggling search bar visibility rapidly 5 times without state corruption', async ({ page }) => {
    const searchIcon = page.locator('.search-icon-btn').first();
    const searchContainer = page.locator('.search-container').first();
    for (let i = 0; i < 4; i++) {
      await searchIcon.click();
      await page.waitForTimeout(150);
    }
    // After even number of clicks, search should be closed. Click once more to open.
    await searchIcon.click();
    await expect(searchContainer).toHaveClass(/is-open/);
  });

  test('should process search immediately when pressing Enter key', async ({ page }) => {
    const searchIcon = page.locator('.search-icon-btn').first();
    await searchIcon.click();
    const searchInput = page.locator('input.search-input-field').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('avengers');
    await searchInput.press('Enter');
    // It should navigate to search results page
    await page.waitForURL(/\/tim-kiem/);
    await expect(page.locator('.search-results-page, .search-container')).toBeVisible();
  });

});

