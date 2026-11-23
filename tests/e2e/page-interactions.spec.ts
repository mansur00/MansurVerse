import { test, expect } from '@playwright/test';

test.describe('Phase 5d Page Interactions Suite', () => {
  // ==========================================
  // Work Page (I-22, I-23, I-24)
  // ==========================================
  test('Work: I-22 filter chips reflow and update live count', async ({ page }) => {
    await page.goto('/work');
    await expect(page.locator('.projects-grid-section')).toHaveAttribute(
      'data-work-motion-initialized',
      'true',
    );

    const cards = page.locator('.projects-grid .project-card');
    const initialCount = await cards.count();
    expect(initialCount).toBeGreaterThan(0);

    const countWrapper = page.locator('.count-wrapper');
    await expect(countWrapper).toHaveAttribute('aria-live', 'polite');

    const filterChips = page.locator('[data-filter-chip]');
    const chipCount = await filterChips.count();
    expect(chipCount).toBeGreaterThan(1);

    // Click second filter chip
    const secondChip = filterChips.nth(1);
    const catName = await secondChip.getAttribute('data-filter-chip');
    await secondChip.click();

    await expect(secondChip).toHaveAttribute('aria-pressed', 'true');

    // Wait for Flip transition
    await page.waitForTimeout(600);

    // Visible cards should all match category
    const visibleCards = page.locator('.projects-grid .project-card:visible');
    const visibleCount = await visibleCards.count();

    for (let i = 0; i < visibleCount; i++) {
      const cardCat = await visibleCards.nth(i).getAttribute('data-category');
      expect(cardCat).toBe(catName);
    }

    // Reset back to All
    const allChip = filterChips.first();
    await allChip.click();
    await page.waitForTimeout(600);

    const restoredCount = await page.locator('.projects-grid .project-card:visible').count();
    expect(restoredCount).toBe(initialCount);
  });

  test('Work: I-22 empty state and reset button', async ({ page }) => {
    await page.goto('/work');
    await expect(page.locator('.projects-grid-section')).toHaveAttribute(
      'data-work-motion-initialized',
      'true',
    );

    // Filter cards to simulate empty state by evaluating filter with non-existent cat
    await page.evaluate(() => {
      const setter = (window as unknown as { __setWorkFilter?: (cat: string) => void })
        .__setWorkFilter;
      if (setter) setter('NonExistentCategory');
    });

    const emptyState = page.locator('.empty-state');
    await expect(emptyState).toBeVisible();

    const resetBtn = page.locator('[data-reset-filter]');
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    await expect(emptyState).toBeHidden();
  });

  test('Work: I-23 view toggle switches grid and list layouts', async ({ page }) => {
    await page.goto('/work');
    await expect(page.locator('.projects-grid-section')).toHaveAttribute(
      'data-work-motion-initialized',
      'true',
    );

    const container = page.locator('.projects-grid-section');
    const gridBtn = page.locator('[data-view-toggle="grid"]');
    const listBtn = page.locator('[data-view-toggle="list"]');

    await expect(gridBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(listBtn).toHaveAttribute('aria-pressed', 'false');

    // Switch to list
    await listBtn.click();
    await page.waitForTimeout(500);

    await expect(container).toHaveClass(/is-list-view/);
    await expect(listBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(gridBtn).toHaveAttribute('aria-pressed', 'false');

    // Switch back to grid
    await gridBtn.click();
    await page.waitForTimeout(500);

    await expect(container).not.toHaveClass(/is-list-view/);
    await expect(gridBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('Work: I-24 card tilt applies 3D rotation on fine pointer', async ({ page }) => {
    await page.goto('/work');
    await expect(page.locator('.projects-grid-section')).toHaveAttribute(
      'data-work-motion-initialized',
      'true',
    );

    const firstCard = page.locator('.projects-grid .project-card').first();
    await expect(firstCard).toBeVisible();

    const box = await firstCard.boundingBox();
    expect(box).toBeTruthy();

    if (box) {
      // Move mouse to top-right corner of card to trigger tilt
      await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.1);
      await page.waitForTimeout(300);

      const transform = await firstCard.evaluate((el) => window.getComputedStyle(el).transform);
      expect(transform).not.toBe('none');

      // Leave card
      await page.mouse.move(0, 0);
      await page.waitForTimeout(450);
    }
  });

  // ==========================================
  // Case Study Page (I-25, I-26, I-27, I-28)
  // ==========================================
  test('Case Study: I-25 scroll-spy highlights active section in sidebar', async ({ page }) => {
    await page.goto('/work/project-one');
    await expect(page.locator('.case-body-section')).toHaveAttribute(
      'data-case-motion-initialized',
      'true',
    );

    const sidebarLinks = page.locator('.sections-list .section-link');
    const linkCount = await sidebarLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Clicking sidebar link scrolls and activates section
    const secondLink = sidebarLinks.nth(1);
    await secondLink.click();
    await page.waitForTimeout(400);

    await expect(secondLink).toHaveClass(/is-active/);
    await expect(secondLink).toHaveAttribute('aria-current', 'true');
  });

  test('Case Study: I-26 compare slider responds to range input and keyboard', async ({ page }) => {
    await page.goto('/work/project-one');
    await expect(page.locator('.case-body-section')).toHaveAttribute(
      'data-case-motion-initialized',
      'true',
    );

    const slider = page.locator('.compare-slider[data-motion="compare-slider"]');
    await expect(slider).toBeVisible();

    const rangeInput = slider.locator('.compare-range-input');
    await expect(rangeInput).toHaveValue('50');

    // Focus range input and press ArrowLeft
    await rangeInput.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(rangeInput).toHaveValue('49');

    // Shift + ArrowRight steps 10
    await page.keyboard.press('Shift+ArrowRight');
    await expect(rangeInput).toHaveValue('59');

    // Check CSS variable on slider
    const pos = await slider.evaluate((el) => el.style.getPropertyValue('--slider-pos'));
    expect(pos.trim()).toBe('59%');
  });

  test('Case Study: I-28 pull to next project panel renders fallback button', async ({ page }) => {
    await page.goto('/work/project-one');
    await expect(page.locator('.case-body-section')).toHaveAttribute(
      'data-case-motion-initialized',
      'true',
    );

    const nextSection = page.locator('.case-next-section');
    await expect(nextSection).toBeVisible();

    const nextBtn = nextSection.locator('a');
    await expect(nextBtn).toBeVisible();
    const href = await nextBtn.getAttribute('href');
    expect(href).toMatch(/^\/work\//);
  });

  // ==========================================
  // About Page (I-29, I-31, I-32)
  // ==========================================
  test('About: I-29 portrait spotlight tracks pointer', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('.about-portrait-wrapper')).toHaveAttribute(
      'data-about-initialized',
      'true',
    );

    const wrapper = page.locator('.about-portrait-wrapper[data-spotlight]');
    await expect(wrapper).toBeVisible();

    const box = await wrapper.boundingBox();
    expect(box).toBeTruthy();

    if (box) {
      await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.75);
      await page.waitForTimeout(200);

      const spotX = await wrapper.evaluate((el) => el.style.getPropertyValue('--spotlight-x'));
      const spotY = await wrapper.evaluate((el) => el.style.getPropertyValue('--spotlight-y'));
      expect(spotX).toBeTruthy();
      expect(spotY).toBeTruthy();
    }
  });

  test('About: I-31 skill chips and I-32 experience rows', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('.about-portrait-wrapper')).toHaveAttribute(
      'data-about-initialized',
      'true',
    );

    const skillChips = page.locator('.skill-chips-container .chip');
    await expect(skillChips.first()).toBeVisible();

    const expRows = page.locator('.experience-row-wrapper');
    const expCount = await expRows.count();
    expect(expCount).toBeGreaterThan(1);

    // Hover over second row and verify dimming on sibling
    const firstRow = expRows.nth(0);
    const secondRow = expRows.nth(1);

    await secondRow.hover();
    await page.waitForTimeout(300);

    const firstOpacity = await firstRow.evaluate((el) => window.getComputedStyle(el).opacity);
    expect(parseFloat(firstOpacity)).toBeLessThanOrEqual(0.7);
  });

  // ==========================================
  // Contact & 404 Pages (I-19, I-33, I-35)
  // ==========================================
  test('Contact: I-33 form validation on blur and success submission flow', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('.contact-form')).toHaveAttribute('data-contact-initialized', 'true');

    const form = page.locator('.contact-form');
    await expect(form).toBeVisible();

    const nameInput = form.locator('input[name="name"]');
    const emailInput = form.locator('input[name="email"]');
    const messageInput = form.locator('textarea[name="message"]');
    const submitBtn = form.locator('button[type="submit"]');

    // 1. Blur without input triggers validation error
    await nameInput.focus();
    await nameInput.blur();

    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    await expect(nameInput).toHaveAttribute('aria-describedby', 'name-message');

    // 2. Fill valid values
    await nameInput.fill('Jane Doe');
    await emailInput.fill('jane@example.com');
    await messageInput.fill('Hello world project inquiry');

    // 3. Submit form -> enters 'sending' then 'sent'
    await submitBtn.click();

    await expect(form).toHaveAttribute('data-form-state', 'sending');
    await expect(submitBtn).toBeDisabled();

    // Wait for mock API resolve
    await expect(form).toHaveAttribute('data-form-state', 'sent');
    await expect(submitBtn).toHaveText(/Sent ✓/);
  });

  test('Contact: I-33 form failure triggers mailto fallback with role="alert"', async ({
    page,
  }) => {
    await page.goto('/contact');
    await expect(page.locator('.contact-form')).toHaveAttribute('data-contact-initialized', 'true');

    const form = page.locator('.contact-form');
    const nameInput = form.locator('input[name="name"]');
    const emailInput = form.locator('input[name="email"]');
    const messageInput = form.locator('textarea[name="message"]');
    const submitBtn = form.locator('button[type="submit"]');

    await nameInput.fill('Jane Doe');
    await emailInput.fill('jane@example.com');
    await messageInput.fill('error'); // Triggers simulated network failure

    await submitBtn.click();

    // Wait for failure
    const errorAlert = form.locator('.form-feedback.error-feedback');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toHaveAttribute('role', 'alert');

    const fallbackLink = errorAlert.locator('a.fallback-link');
    await expect(fallbackLink).toHaveAttribute('href', /^mailto:/);
  });

  test('Contact & 404: I-19 and I-35 letter repel preserves accessible names', async ({ page }) => {
    // 404 Heading
    await page.goto('/404');
    await expect(page.locator('.not-found-title')).toHaveAttribute(
      'data-repel-initialized',
      'true',
    );
    const heading404 = page.locator('.not-found-title');
    await expect(heading404).toBeVisible();

    const ariaLabel = await heading404.getAttribute('aria-label');
    expect(ariaLabel).toBe('404');

    const letterSpans = heading404.locator('.repel-letter');
    const count = await letterSpans.count();
    expect(count).toBe(3);

    // Pointer move near letters applies transform
    const box = await heading404.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(200);

      const firstSpanTransform = await letterSpans
        .first()
        .evaluate((el) => window.getComputedStyle(el).transform);
      expect(firstSpanTransform).not.toBe('none');
    }
  });
});
