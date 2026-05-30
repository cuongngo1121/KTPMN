import { test, expect } from '@playwright/test';

test.describe('CMovie - Video Playback & Responsive UI', () => {

  test('should load details, navigate to watch page, play video, and switch episodes', async ({ page }) => {
    // Set desktop resolution
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // 1. Go to homepage and wait for content
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click the first movie card on the homepage to open details
    // Movie cards are rendered as MovieCard component with custom hover style
    const firstMovieCard = page.locator('.movie-card:visible').first();
    await expect(firstMovieCard).toBeVisible({ timeout: 10000 });
    await firstMovieCard.click();

    // 2. We should be on /movie/:slug page now
    await page.waitForURL(/\/movie\/.+/);
    console.log(`Movie detail loaded: ${page.url()}`);
    
    const movieTitle = page.locator('h1.from-white').first();
    await expect(movieTitle).toBeVisible();
    const titleText = await movieTitle.textContent();
    console.log(`Movie Title: ${titleText}`);

    // Click watch button "XEM PHIM"
    const watchBtn = page.locator('button', { hasText: 'XEM PHIM' });
    await expect(watchBtn).toBeVisible();
    await watchBtn.click();

    // 3. We should be on /watch/:slug watch page now
    await page.waitForURL(/\/watch\/.+/);
    console.log(`Watch page loaded: ${page.url()}`);

    // Verify player section container is present
    const playerContainer = page.locator('.player-container');
    await expect(playerContainer).toBeVisible({ timeout: 15000 });

    // Verify video player element or fallback iframe is present
    const videoElement = page.locator('.video-element');
    await expect(videoElement).toBeVisible();
    console.log('Video element container loaded successfully.');

    // Verify episode sidebar is visible
    const episodeListHeader = page.locator('h3', { hasText: 'Danh sách tập' });
    await expect(episodeListHeader).toBeVisible();

    // Verify list of episode buttons
    const epButtons = page.locator('.custom-scrollbar button');
    const epCount = await epButtons.count();
    console.log(`Found ${epCount} episodes in sidebar.`);

    if (epCount > 1) {
      // Get current active episode button
      const firstActiveEp = epButtons.first();
      await expect(firstActiveEp).toHaveClass(/bg-gradient-to-br/); // active styling class from MovieWatch.vue

      // Click the second episode button
      const secondEp = epButtons.nth(1);
      const secondEpName = await secondEp.textContent();
      console.log(`Switching to episode: ${secondEpName}`);
      
      await secondEp.click();

      // Verify the loading indicator overlay pops up or loading completes
      const loadingOverlay = page.locator('.player-container > div', { hasText: 'Đang tải tập' });
      // The loading overlay has a transition and simulates 800ms delay
      await expect(loadingOverlay).not.toBeVisible({ timeout: 5000 });

      // Verify the second episode becomes active
      await expect(secondEp).toHaveClass(/bg-gradient-to-br/);
      console.log('Episode switched and loaded successfully.');
    }
  });

  test('should display responsive layouts properly on Mobile Portrait', async ({ page }) => {
    // 1. Configure to Mobile Portrait
    await page.setViewportSize({ width: 375, height: 812 });

    // 2. Go to watch page (we can go to homepage first and then click watch, or navigate directly if we have a valid slug, but let's go to homepage and details for absolute certainty)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const firstMovieCard = page.locator('.movie-card:visible').first();
    await expect(firstMovieCard).toBeVisible({ timeout: 10000 });
    await firstMovieCard.click();
    await page.waitForURL(/\/movie\/.+/);

    const watchBtn = page.locator('button', { hasText: 'XEM PHIM' });
    await watchBtn.click();
    await page.waitForURL(/\/watch\/.+/);

    // Verify page elements adjust to mobile portrait
    const playerContainer = page.locator('.player-container');
    await expect(playerContainer).toBeVisible();
    
    // Check that grid layout is collapsed (on mobile, columns are stacked)
    // Desktop: aspect-video, Sidebar grid-cols-3
    // On Mobile, the sidebar has grid-cols-5 or grid-cols-6
    const mobileEpGrid = page.locator('.grid-cols-5, .grid-cols-6');
    await expect(mobileEpGrid.first()).toBeVisible();
    console.log('Mobile portrait layout verified successfully (episode list adjusted to wider grid columns).');
  });

  test('should navigate correctly when clicking tabs on the mobile bottom navigation dock', async ({ page }) => {
    // 1. Configure to Mobile Portrait
    await page.setViewportSize({ width: 375, height: 812 });

    // 2. Go to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify the bottom nav bar is visible on mobile
    const bottomNav = page.locator('nav.fixed.bottom-0');
    await expect(bottomNav).toBeVisible();

    // 3. Click "Phim Lẻ" tab
    const phimLeTab = bottomNav.locator('button', { hasText: 'Phim Lẻ' }).first();
    await expect(phimLeTab).toBeVisible();
    await phimLeTab.click();
    // Wait for URL to change to the phim-le category page
    await page.waitForURL(/\/category\/phim-le/);
    console.log('Successfully navigated to Phim Lẻ via bottom nav.');

    // 4. Click "Phim Bộ" tab
    const phimBoTab = bottomNav.locator('button', { hasText: 'Phim Bộ' }).first();
    await expect(phimBoTab).toBeVisible();
    await phimBoTab.click();
    // Wait for URL to change to the phim-bo category page
    await page.waitForURL(/\/category\/phim-bo/);
    console.log('Successfully navigated to Phim Bộ via bottom nav.');

    // 5. Click "Trang chủ" tab
    const homeTab = bottomNav.locator('button', { hasText: 'Trang chủ' }).first();
    await expect(homeTab).toBeVisible();
    await homeTab.click();
    // Wait for URL to change back to homepage
    await page.waitForURL('/');
    console.log('Successfully navigated back to Trang chủ via bottom nav.');
  });

  test('should trigger immersive fullscreen view on Mobile Landscape', async ({ page }) => {
    // 1. Configure to Mobile Landscape (orientation landscape, max-height 500px)
    await page.setViewportSize({ width: 812, height: 375 });

    // 2. Go to homepage -> movie detail -> watch page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const firstMovieCard = page.locator('.movie-card:visible').first();
    await expect(firstMovieCard).toBeVisible({ timeout: 10000 });
    await firstMovieCard.click();
    await page.waitForURL(/\/movie\/.+/);

    const watchBtn = page.locator('button', { hasText: 'XEM PHIM' });
    await watchBtn.click();
    await page.waitForURL(/\/watch\/.+/);

    // 3. Verify mobile landscape CSS styles
    // The player section should enter fixed immersive screen bounds
    const playerSection = page.locator('.player-section');
    await expect(playerSection).toBeVisible();
    
    // In landscape mobile orientation, player-section has position fixed, inset 0
    const boundingBox = await playerSection.boundingBox();
    console.log(`Player Section bounding box: width=${boundingBox.width}, height=${boundingBox.height}`);
    expect(boundingBox.width).toBeCloseTo(812, 1);
    expect(boundingBox.height).toBeCloseTo(375, 1);

    // The breadcrumb navigation and details section are hidden on landscape mobile
    const breadcrumb = page.locator('.player-section .breadcrumb-bar');
    await expect(breadcrumb).not.toBeVisible();

    // Verify the aspect toolbar is present
    // <div v-if="isLandscapeMobile" class="aspect-toolbar ...">
    const aspectToolbar = page.locator('.aspect-toolbar');
    await expect(aspectToolbar).toBeVisible();
    console.log('Aspect Ratio toolbar is visible on Mobile Landscape.');

    // Click on "Đầy" aspect ratio option to stretch player
    const fillBtn = aspectToolbar.locator('button', { hasText: 'Đầy' });
    await expect(fillBtn).toBeVisible();
    await fillBtn.click();
    console.log('Clicked "Đầy" aspect ratio mode.');

    // Verify that the player container applies correct class
    const playerContainer = page.locator('.player-container');
    await expect(playerContainer).toHaveClass(/aspect-fill/);
    console.log('Mobile landscape immersive controls and responsive styling verified.');
  });

  test('should allow user to submit a comment on movie watch page', async ({ page }) => {
    // Navigate directly to a movie watch page
    await page.goto('/watch/tan-hong-trang');
    await page.waitForLoadState('networkidle');

    // Locate the comment input textarea
    const commentInput = page.locator('textarea[placeholder="Viết bình luận của bạn..."]').first();
    await expect(commentInput).toBeVisible();

    // Type a comment
    await commentInput.fill('Phim hay quá cả nhà ơi, nhiệt liệt đề cử!');

    // Click submit button
    const submitBtn = page.locator('button', { hasText: 'Gửi bình luận' }).first();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Assert that a success toast appears (which will FAIL because clicking "Gửi bình luận" does nothing or doesn't submit successfully to a real backend in this mock frontend)
    const successToast = page.locator('.toast-success, .toast-title', { hasText: 'Bình luận thành công' }).first();
    await expect(successToast).toBeVisible({ timeout: 5000 });
  });
});
